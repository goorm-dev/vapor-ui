/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RawValue {
    kind: 'literal' | 'token' | 'ternary' | 'unknown';
    rawText?: string;
    token?: string;
    literal?: string | number;
    consequent?: RawValue;
    alternate?: RawValue;
    testNode?: unknown;
    loc: { line: number; column: number };
}

export interface RawEntry {
    property: string;
    loc: { line: number; column: number };
    error?: 'spread' | 'computed-key';
    value?: RawValue;
    conditions?: Array<{
        conditionKey: string;
        value: RawValue;
        loc: { line: number; column: number };
    }>;
    testNode?: unknown;
}

function locOf(node: any): { line: number; column: number } {
    const start = node.loc?.start;
    return {
        line: start?.line ?? 1,
        column: start?.column ?? 0,
    };
}

function readValueExpression(node: any): RawValue {
    const loc = locOf(node);
    if (node.type === 'Literal') {
        // oxc emits ESTree-style `Literal` for string/number/boolean/null/regex.
        // Distinguish string vs number by typeof node.value.
        if (typeof node.value === 'string') {
            if (node.value.startsWith('$')) {
                return { kind: 'token', token: node.value.slice(1), rawText: node.value, loc };
            }
            return { kind: 'literal', literal: node.value, rawText: node.value, loc };
        }
        if (typeof node.value === 'number') {
            return { kind: 'literal', literal: node.value, rawText: String(node.value), loc };
        }
        return { kind: 'unknown', loc };
    }
    if (node.type === 'ConditionalExpression') {
        return {
            kind: 'ternary',
            consequent: readValueExpression(node.consequent),
            alternate: readValueExpression(node.alternate),
            testNode: node.test,
            loc,
        };
    }
    return { kind: 'unknown', loc };
}

function keyName(prop: any): string | null {
    if (prop.computed) return null;
    if (prop.key.type === 'Identifier') return prop.key.name;
    if (prop.key.type === 'Literal' && typeof prop.key.value === 'string') return prop.key.value;
    return null;
}

export function parseCallArgs(arg: any): RawEntry[] {
    const out: RawEntry[] = [];
    if (!arg || arg.type !== 'ObjectExpression') return out;

    for (const prop of arg.properties) {
        if (prop.type === 'SpreadElement') {
            out.push({ property: '<spread>', loc: locOf(prop), error: 'spread' });
            continue;
        }
        if (prop.type !== 'Property') continue;
        if (prop.computed) {
            out.push({ property: '<computed>', loc: locOf(prop), error: 'computed-key' });
            continue;
        }
        const name = keyName(prop);
        if (name === null) {
            out.push({ property: '<computed>', loc: locOf(prop), error: 'computed-key' });
            continue;
        }

        const valueNode = prop.value;
        if (valueNode?.type === 'ObjectExpression') {
            const conditions: RawEntry['conditions'] = [];
            for (const inner of valueNode.properties) {
                if (inner.type !== 'Property' || inner.computed) {
                    conditions.push({
                        conditionKey: '<bad>',
                        value: { kind: 'unknown', loc: locOf(inner) },
                        loc: locOf(inner),
                    });
                    continue;
                }
                const ck =
                    inner.key.type === 'Identifier'
                        ? inner.key.name
                        : inner.key.type === 'Literal' && typeof inner.key.value === 'string'
                          ? inner.key.value
                          : '<bad>';
                conditions.push({
                    conditionKey: ck,
                    value:
                        inner.value && typeof inner.value.type === 'string'
                            ? readValueExpression(inner.value)
                            : { kind: 'unknown', loc: locOf(inner) },
                    loc: locOf(inner),
                });
            }
            out.push({ property: name, loc: locOf(prop), conditions });
            continue;
        }

        if (!valueNode || typeof valueNode.type !== 'string') {
            out.push({
                property: name,
                loc: locOf(prop),
                value: { kind: 'unknown', loc: locOf(prop) },
            });
            continue;
        }

        out.push({ property: name, loc: locOf(prop), value: readValueExpression(valueNode) });
    }

    return out;
}
