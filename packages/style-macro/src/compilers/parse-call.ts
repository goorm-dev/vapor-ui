import { generateArbitraryValueSelector } from '~/models/class-name';
import { composeContext, parseSelector } from '~/models/selector';
import { expandShorthand } from '~/models/shorthand';
import { resolveToken } from '~/models/tokens';
import type { AnyProp, BuildError, IRRule } from '~/models/types';
import { normalizeValue } from '~/models/value';

export interface TernarySite {
    consequentRuleIndexes: number[];
    alternateRuleIndexes: number[];
    testStart: number;
    testEnd: number;
}

export interface ParseCallResult {
    rules: IRRule[];
    ternaries: TernarySite[];
    errors: BuildError[];
}

/* ----- constants ----- */

const IDENTIFIER_PROPS = new Set([
    'animation-name',
    'will-change',
    'counter-reset',
    'counter-increment',
    'content',
    'grid-template-areas',
]);

const HAS_TOKEN_REGEX = /\$[a-zA-Z0-9_-]+/;
const TOKEN_SUBSTITUTE_REGEX = /\$([a-zA-Z0-9_-]+)/g;

/* ----- utils ----- */

const toKebab = (prop: string) =>
    prop.startsWith('--')
        ? prop
        : prop
              .replace(/([A-Z])/g, '-$1')
              .toLowerCase()
              .replace(/^-/, '');

const kebabToCamel = (prop: string) => prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

const locOf = (node: AnyProp): Loc => {
    const start = node?.loc?.start;
    return { line: start?.line ?? 1, column: start?.column ?? 0 };
};

const keyName = (prop: AnyProp): string | null => {
    if (prop.computed) return null;

    const key = prop.key;

    if (key?.type === 'Identifier') return key.name;
    if (key?.type === 'Literal' && typeof key.value === 'string') return key.value;

    return null;
};

/** 리터럴 / 음수 리터럴 / 보간 없는 템플릿 → 값 반환. 아니면 null (dynamic). */
function extractStaticValue(node: AnyProp): string | number | null {
    if (!node) return null;
    if (node.type === 'Literal') {
        const v = node.value;
        return typeof v === 'string' || typeof v === 'number' ? v : null;
    }
    if (
        node.type === 'UnaryExpression' &&
        node.operator === '-' &&
        node.argument?.type === 'Literal' &&
        typeof node.argument.value === 'number'
    ) {
        return -node.argument.value;
    }
    if (node.type === 'TemplateLiteral' && node.expressions?.length === 0) {
        return node.quasis?.[0]?.value?.cooked ?? null;
    }

    return null;
}

const hasPosition = (node: AnyProp): boolean =>
    !!node && typeof node.start === 'number' && typeof node.end === 'number';

/* ----- parser ----- */

/**
 * `css({...})` 호출 1개를 파싱해 IR + ternary + build error 로 분해.
 */
export function createParser(source: string) {
    const rules: IRRule[] = [];
    const buildErrors: BuildError[] = [];
    const ternaries: TernarySite[] = [];

    const pushError = (err: BuildError) => buildErrors.push(err);

    const recordRuleRange = (fn: () => void): number[] => {
        const start = rules.length;
        fn();
        const out: number[] = [];
        for (let i = start; i < rules.length; i++) out.push(i);
        return out;
    };

    function walkObject(obj: AnyProp, selectorContext: string, isTop: boolean) {
        if (!obj?.properties) return;
        for (const prop of obj.properties) {
            if (prop.type === 'SpreadElement') {
                pushError(spread(locOf(prop)));
                continue;
            }
            if (prop.type !== 'Property') {
                pushError(unsupportedProp(locOf(prop)));
                continue;
            }
            handleProperty(prop, selectorContext, isTop);
        }
    }

    function handleProperty(prop: AnyProp, selectorContext: string, isTop: boolean) {
        const name = keyName(prop);
        if (prop.computed || name === null) {
            pushError(computedKey(locOf(prop.key ?? prop)));
            return;
        }

        const value = prop.value;

        // 중첩 객체 → selector 확장
        if (value?.type === 'ObjectExpression') {
            handleNestedObject(name, value, selectorContext, prop);
            return;
        }

        const cssProperty = toKebab(name);

        // 최상위 삼항 → build-time 2-way 전개
        if (isTop && value?.type === 'ConditionalExpression') {
            handleTernary(cssProperty, value, selectorContext);
            return;
        }

        // 리터럴/토큰 → static, 아니면 dynamic slot
        const staticVal = extractStaticValue(value);
        if (staticVal === null) {
            handleDynamic(cssProperty, value, selectorContext);
            return;
        }

        pushStatic(cssProperty, staticVal, selectorContext, locOf(value));
    }

    function handleNestedObject(
        name: string,
        value: AnyProp,
        selectorContext: string,
        prop: AnyProp,
    ) {
        try {
            parseSelector(name);
        } catch {
            pushError(invalidSelector(locOf(prop.key ?? prop), name));
            return;
        }
        walkObject(value, composeContext(selectorContext, name), false);
    }

    function handleTernary(cssProperty: string, value: AnyProp, selectorContext: string) {
        const conseqLit = extractStaticValue(value.consequent);
        const altLit = extractStaticValue(value.alternate);

        if (conseqLit === null || altLit === null) {
            pushError(ternaryDynamic(locOf(value)));
            return;
        }

        const loc = locOf(value);
        const consequentRuleIndexes = recordRuleRange(() =>
            pushStatic(cssProperty, conseqLit, selectorContext, loc),
        );
        const alternateRuleIndexes = recordRuleRange(() =>
            pushStatic(cssProperty, altLit, selectorContext, loc),
        );

        ternaries.push({
            consequentRuleIndexes,
            alternateRuleIndexes,
            testStart: value.test.start,
            testEnd: value.test.end,
        });
    }

    function handleDynamic(cssProperty: string, value: AnyProp, selectorContext: string) {
        if (IDENTIFIER_PROPS.has(cssProperty)) {
            pushError(dynamicNotAllowed(locOf(value), cssProperty));
            return;
        }
        if (!hasPosition(value)) {
            pushError(cannotCaptureDynamic(locOf(value), cssProperty));
            return;
        }

        const sourceExpr = source.slice(value.start, value.end);
        const slotId = generateArbitraryValueSelector(
            `${cssProperty}|${selectorContext}|${sourceExpr}`,
        );

        for (const e of expandShorthand(cssProperty, `var(--slot-${slotId})`)) {
            rules.push({
                kind: 'dynamic',
                property: e.property,
                slotId,
                selectorContext,
                sourceExpr,
            });
        }
    }

    function pushStatic(
        cssProperty: string,
        rawValue: string | number,
        selectorContext: string,
        loc: Loc,
    ) {
        const jsProperty = kebabToCamel(cssProperty);
        const value =
            typeof rawValue === 'string' && HAS_TOKEN_REGEX.test(rawValue)
                ? substituteTokens(cssProperty, jsProperty, rawValue, loc)
                : normalizeValue({ property: jsProperty, rawValue }).css;

        for (const e of expandShorthand(cssProperty, value)) {
            rules.push({
                kind: 'static',
                property: e.property,
                value: e.value,
                rawValue: String(rawValue),
                selectorContext,
            });
        }
    }

    /** `$token` fragment 치환. 실패는 ctx.errors 로 push (build error). */
    function substituteTokens(
        cssProperty: string,
        jsProperty: string,
        rawValue: string,
        loc: Loc,
    ): string {
        return rawValue.replace(TOKEN_SUBSTITUTE_REGEX, (match, tokenName: string) => {
            const res = resolveToken(jsProperty, tokenName);
            if ('error' in res) {
                pushError(tokenError[res.error](loc, cssProperty, tokenName, rawValue));
                return match;
            }
            return res.cssVar;
        });
    }

    return {
        parse(arg: AnyProp): ParseCallResult {
            if (!arg || arg.type !== 'ObjectExpression') {
                pushError(invalidInputShape(locOf(arg ?? { loc: undefined })));
            } else {
                walkObject(arg, 'base', true);
            }
            return { rules, ternaries, errors: buildErrors };
        },
    };
}

export function parseCallArg(arg: AnyProp, source: string): ParseCallResult {
    return createParser(source).parse(arg);
}

/* ----- errors ----- */

type Loc = { line: number; column: number };

const spread = (loc: Loc): BuildError => ({
    code: 'spread',
    message: 'Spread elements are not supported in css().',
    loc,
});

const unsupportedProp = (loc: Loc): BuildError => ({
    code: 'invalid-input-shape',
    message: 'Unsupported property node.',
    loc,
});

const computedKey = (loc: Loc): BuildError => ({
    code: 'computed-key',
    message: 'Computed keys are not supported in css().',
    loc,
});

const invalidInputShape = (loc: Loc): BuildError => ({
    code: 'invalid-input-shape',
    message: 'css() requires an object literal argument.',
    loc,
});

const invalidSelector = (loc: Loc, name: string): BuildError => ({
    code: 'invalid-selector',
    message: `Invalid nested selector "${name}". Must start with ':', '::', '@', '[', or '&'.`,
    loc,
});

const ternaryDynamic = (loc: Loc): BuildError => ({
    code: 'dynamic-value',
    message: 'Ternary branches must be literals or tokens at the entry-level ternary.',
    loc,
});

const dynamicNotAllowed = (loc: Loc, cssProperty: string): BuildError => ({
    code: 'dynamic-value',
    message: `Dynamic value is not allowed for property "${cssProperty}".`,
    loc,
});

const cannotCaptureDynamic = (loc: Loc, cssProperty: string): BuildError => ({
    code: 'dynamic-value',
    message: `Cannot capture dynamic value for "${cssProperty}".`,
    loc,
});

const tokenErrorBlock = (header: string, cssProperty: string, rawValue: string) =>
    ['', header, `  - 속성: ${cssProperty}`, `  - 입력: "${rawValue}"`, ''].join('\n');

const unknownToken = (
    loc: Loc,
    cssProperty: string,
    tokenName: string,
    rawValue: string,
): BuildError => ({
    code: 'unknown-token',
    message: tokenErrorBlock('알 수 없는 토큰입니다.', cssProperty, rawValue),
    loc,
});

const scopeMismatch = (
    loc: Loc,
    cssProperty: string,
    tokenName: string,
    rawValue: string,
): BuildError => ({
    code: 'scope-mismatch',
    message: tokenErrorBlock('토큰 scope 가 property 와 일치하지 않습니다.', cssProperty, rawValue),
    loc,
});

const unknownProperty = (
    loc: Loc,
    cssProperty: string,
    tokenName: string,
    rawValue: string,
): BuildError => ({
    code: 'unknown-property',
    message: tokenErrorBlock('토큰을 지원하지 않는 property 입니다.', cssProperty, rawValue),
    loc,
});

const tokenError = {
    'unknown-token': unknownToken,
    'scope-mismatch': scopeMismatch,
    'unknown-property': unknownProperty,
} as const;
