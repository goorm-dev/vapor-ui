import * as t from '@babel/types';

export interface RawValue {
    kind: 'literal' | 'token' | 'ternary' | 'unknown';
    rawText?: string;
    token?: string;
    literal?: string | number;
    consequent?: RawValue;
    alternate?: RawValue;
    testNode?: t.Expression;
    loc: { line: number; column: number };
}

export interface RawEntry {
    property: string;
    loc: { line: number; column: number };
    error?: 'spread' | 'computed-key';
    value?: RawValue;
    conditions?: Array<{ conditionKey: string; value: RawValue; loc: { line: number; column: number } }>;
    testNode?: t.Expression;
}

function locOf(node: t.Node): { line: number; column: number } {
    return {
        line: node.loc?.start.line ?? 1,
        column: node.loc?.start.column ?? 0,
    };
}

function readValueExpression(node: t.Node): RawValue {
    const loc = locOf(node);
    if (t.isStringLiteral(node)) {
        if (node.value.startsWith('$')) {
            return { kind: 'token', token: node.value.slice(1), rawText: node.value, loc };
        }
        return { kind: 'literal', literal: node.value, rawText: node.value, loc };
    }
    if (t.isNumericLiteral(node)) {
        return { kind: 'literal', literal: node.value, rawText: String(node.value), loc };
    }
    if (t.isConditionalExpression(node)) {
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

export function parseCallArgs(arg: t.ObjectExpression): RawEntry[] {
    const out: RawEntry[] = [];
    for (const prop of arg.properties) {
        if (t.isSpreadElement(prop)) {
            out.push({ property: '<spread>', loc: locOf(prop), error: 'spread' });
            continue;
        }
        if (!t.isObjectProperty(prop)) continue;
        if (prop.computed) {
            out.push({ property: '<computed>', loc: locOf(prop), error: 'computed-key' });
            continue;
        }
        const name = t.isIdentifier(prop.key)
            ? prop.key.name
            : t.isStringLiteral(prop.key)
              ? prop.key.value
              : null;
        if (!name) {
            out.push({ property: '<unknown>', loc: locOf(prop), error: 'computed-key' });
            continue;
        }

        const valueNode = prop.value;
        if (t.isObjectExpression(valueNode)) {
            const conditions: Array<{
                conditionKey: string;
                value: RawValue;
                loc: { line: number; column: number };
            }> = [];
            for (const inner of valueNode.properties) {
                if (!t.isObjectProperty(inner) || inner.computed) {
                    conditions.push({
                        conditionKey: '<bad>',
                        value: { kind: 'unknown', loc: locOf(inner) },
                        loc: locOf(inner),
                    });
                    continue;
                }
                const ck = t.isIdentifier(inner.key)
                    ? inner.key.name
                    : t.isStringLiteral(inner.key)
                      ? inner.key.value
                      : '<bad>';
                conditions.push({
                    conditionKey: ck,
                    value: t.isExpression(inner.value)
                        ? readValueExpression(inner.value)
                        : { kind: 'unknown', loc: locOf(inner) },
                    loc: locOf(inner),
                });
            }
            out.push({ property: name, loc: locOf(prop), conditions });
            continue;
        }

        if (!t.isExpression(valueNode)) {
            out.push({ property: name, loc: locOf(prop), value: { kind: 'unknown', loc: locOf(prop) } });
            continue;
        }

        out.push({ property: name, loc: locOf(prop), value: readValueExpression(valueNode) });
    }
    return out;
}
