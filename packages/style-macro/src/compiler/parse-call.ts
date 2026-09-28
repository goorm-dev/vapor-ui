import { generateArbitraryValueSelector } from '~/model/class-name';
import { composeContext, parseSelector } from '~/model/selector';
import { expandShorthand } from '~/model/shorthand';
import { resolveToken } from '~/model/tokens';
import type { AnyProp, BuildError, IRRule } from '~/model/types';
import { normalizeValue } from '~/model/value';

const IDENTIFIER_PROPS = new Set([
    'animation-name',
    'will-change',
    'counter-reset',
    'counter-increment',
    'content',
    'grid-template-areas',
]);

export interface TernarySite {
    /** 대체될 CallExpression 노드 안 property 슬롯 위치 정보 */
    property: string;
    consequentClasses: string[];
    alternateClasses: string[];
    testStart: number;
    testEnd: number;
}

export interface ParseCallResult {
    /** 방출된 IR 목록. 동일 selectorContext + property + value 는 중복 허용 (emit 이 dedupe). */
    rules: IRRule[];
    /** entry-level ternary 위치. transform.ts 가 코드 재작성 때 소비. */
    ternaries: TernarySite[];
    /** call site 전용 build errors. */
    errors: BuildError[];
}

function toKebab(prop: string): string {
    if (prop.startsWith('--')) return prop;
    return prop
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
}

function locOf(node: AnyProp): { line: number; column: number } {
    const start = node.loc?.start;
    return { line: start?.line ?? 1, column: start?.column ?? 0 };
}

function keyName(prop: AnyProp): string | null {
    if (prop.computed) return null;
    if (prop.key?.type === 'Identifier') return prop.key.name;
    if (prop.key?.type === 'Literal' && typeof prop.key.value === 'string') return prop.key.value;
    return null;
}

function extractStaticValue(node: AnyProp): string | number | null {
    if (!node) return null;
    // oxc: string/number/boolean/null 은 Literal
    if (node.type === 'Literal') {
        if (typeof node.value === 'string' || typeof node.value === 'number') return node.value;
        return null;
    }
    if (node.type === 'UnaryExpression' && node.operator === '-' && node.argument?.type === 'Literal') {
        if (typeof node.argument.value === 'number') return -node.argument.value;
    }
    if (node.type === 'TemplateLiteral' && node.expressions?.length === 0) {
        return node.quasis?.[0]?.value?.cooked ?? null;
    }
    return null;
}

function pushToken(
    rules: IRRule[],
    errors: BuildError[],
    property: string,
    rawValue: string | number,
    selectorContext: string,
    loc: { line: number; column: number },
) {
    // camelCase axis lookup 을 위해 property 를 camelCase 로 정규화 하는 쪽이 편함.
    // parse 시점은 kebab-case 로 통일. axis 는 camelCase key. 두 형태를 다 시도.
    const camel = property.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

    if (typeof rawValue === 'string' && rawValue.startsWith('$')) {
        const tokenName = rawValue.slice(1);
        const res = resolveToken(camel, tokenName);
        if ('error' in res) {
            errors.push({
                code: res.error,
                message:
                    res.error === 'unknown-token'
                        ? `Unknown token "$${tokenName}" for property "${property}".`
                        : res.error === 'scope-mismatch'
                          ? `Token "$${tokenName}" exists but is not valid for property "${property}".`
                          : `Property "${property}" has no token scope defined.`,
                loc,
            });
            return;
        }
        const rawStr = rawValue;
        const expanded = expandShorthand(property, res.cssVar);
        for (const e of expanded) {
            rules.push({
                kind: 'static',
                property: e.property,
                value: e.value,
                rawValue: rawStr,
                selectorContext,
            });
        }
        return;
    }

    const normalized = normalizeValue({ property: camel, rawValue });
    const expanded = expandShorthand(property, normalized.css);
    const rawStr = String(rawValue);
    for (const e of expanded) {
        rules.push({
            kind: 'static',
            property: e.property,
            value: e.value,
            rawValue: rawStr,
            selectorContext,
        });
    }
}

function walkObject(
    obj: AnyProp,
    selectorContext: string,
    rules: IRRule[],
    errors: BuildError[],
    ternaries: TernarySite[],
    source: string,
    isTop: boolean,
) {
    if (!obj?.properties) return;

    for (const prop of obj.properties) {
        if (prop.type === 'SpreadElement') {
            errors.push({
                code: 'spread',
                message: 'Spread elements are not supported in css().',
                loc: locOf(prop),
            });
            continue;
        }
        if (prop.type !== 'Property') {
            errors.push({
                code: 'invalid-input-shape',
                message: 'Unsupported property node.',
                loc: locOf(prop),
            });
            continue;
        }
        if (prop.computed) {
            errors.push({
                code: 'computed-key',
                message: 'Computed keys are not supported in css().',
                loc: locOf(prop.key ?? prop),
            });
            continue;
        }
        const name = keyName(prop);
        if (name === null) {
            errors.push({
                code: 'computed-key',
                message: 'Computed keys are not supported in css().',
                loc: locOf(prop.key ?? prop),
            });
            continue;
        }

        const value = prop.value;

        // Nested object → selector 확장.
        if (value?.type === 'ObjectExpression') {
            try {
                parseSelector(name);
            } catch {
                errors.push({
                    code: 'invalid-selector',
                    message: `Invalid nested selector "${name}". Must start with ':', '::', '@', '[', or '&'.`,
                    loc: locOf(prop.key ?? prop),
                });
                continue;
            }
            const nextContext = composeContext(selectorContext, name);
            walkObject(value, nextContext, rules, errors, ternaries, source, false);
            continue;
        }

        const kebab = toKebab(name);

        // entry-level ternary → 2-way build-time expansion.
        if (isTop && value?.type === 'ConditionalExpression') {
            const conseqLit = extractStaticValue(value.consequent);
            const altLit = extractStaticValue(value.alternate);
            if (conseqLit === null || altLit === null) {
                errors.push({
                    code: 'dynamic-value',
                    message:
                        'Ternary branches must be literals or tokens at the entry-level ternary.',
                    loc: locOf(value),
                });
                continue;
            }
            const conseqRules: IRRule[] = [];
            const altRules: IRRule[] = [];
            pushToken(conseqRules, errors, kebab, conseqLit, selectorContext, locOf(value));
            pushToken(altRules, errors, kebab, altLit, selectorContext, locOf(value));
            rules.push(...conseqRules, ...altRules);
            ternaries.push({
                property: kebab,
                consequentClasses: [], // transform.ts fills after buildClassName
                alternateClasses: [],
                testStart: value.test.start,
                testEnd: value.test.end,
            });
            continue;
        }

        const staticVal = extractStaticValue(value);
        if (staticVal === null) {
            // 동적 값 → slotId 생성 + DynamicRule 방출. transform.ts 가 후속으로 JSX
            // className 자리 근처에 `style={{...slot: _resolveToken(prop, expr)}}` 주입.
            if (IDENTIFIER_PROPS.has(kebab)) {
                errors.push({
                    code: 'dynamic-value',
                    message: `Dynamic value is not allowed for property "${kebab}".`,
                    loc: locOf(value),
                });
                continue;
            }
            if (!value || typeof value.start !== 'number' || typeof value.end !== 'number') {
                errors.push({
                    code: 'dynamic-value',
                    message: `Cannot capture dynamic value for "${kebab}".`,
                    loc: locOf(value),
                });
                continue;
            }
            const sourceExpr = source.slice(value.start, value.end);
            const slotId = generateArbitraryValueSelector(
                `${kebab}|${selectorContext}|${sourceExpr}`,
            );
            // shorthand 확장 시 자식 property 각각을 동일 slotId 로 매핑.
            // 자식 property 이 하나뿐인 (non-shorthand) 케이스는 그대로 반영.
            const expanded = expandShorthand(kebab, `var(--slot-${slotId})`);
            for (const e of expanded) {
                rules.push({
                    kind: 'dynamic',
                    property: e.property,
                    slotId,
                    selectorContext,
                    sourceExpr,
                });
            }
            continue;
        }

        pushToken(rules, errors, kebab, staticVal, selectorContext, locOf(value));
    }
}

export function parseCallArg(arg: AnyProp, source: string): ParseCallResult {
    const rules: IRRule[] = [];
    const errors: BuildError[] = [];
    const ternaries: TernarySite[] = [];
    if (!arg || arg.type !== 'ObjectExpression') {
        errors.push({
            code: 'invalid-input-shape',
            message: 'css() requires an object literal argument.',
            loc: locOf(arg ?? { loc: undefined }),
        });
        return { rules, errors, ternaries };
    }
    walkObject(arg, 'base', rules, errors, ternaries, source, true);
    return { rules, errors, ternaries };
}
