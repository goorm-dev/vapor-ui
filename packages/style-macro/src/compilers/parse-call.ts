import { generateArbitraryValueSelector } from '~/models/class-name';
import { composeContext, parseSelector } from '~/models/selector';
import { expandShorthand } from '~/models/shorthand';
import { resolveToken } from '~/models/tokens';
import type { AnyProp, BuildError, IRRule } from '~/models/types';
import { normalizeValue } from '~/models/value';
import { hyphenate } from '~/tokens/css-reference';

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

// token name 은 반드시 알파벳으로 시작한다 (tokens/* 전부 검사됨). 첫 글자를
// `[a-zA-Z]` 로 제한하면 `content: '"$5"'` 같은 사용자 문자열 내부의 `$<숫자>`
// 가 토큰으로 오인되어 빌드 에러로 이어지는 리뷰 #8 결함을 방지한다.
const HAS_TOKEN_REGEX = /\$[a-zA-Z][a-zA-Z0-9_-]*/;
const TOKEN_SUBSTITUTE_REGEX = /\$([a-zA-Z][a-zA-Z0-9_-]*)/g;

/* ----- utils ----- */

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

/** 값에 영향 없는 래퍼(`as`, `satisfies`, `!`, 괄호)를 벗긴다. */
function unwrapValue(node: AnyProp): AnyProp {
    let n = node;
    while (
        n?.type === 'TSAsExpression' ||
        n?.type === 'TSSatisfiesExpression' ||
        n?.type === 'TSNonNullExpression' ||
        n?.type === 'ParenthesizedExpression'
    ) {
        n = n.expression;
    }
    return n;
}

/** 값이 없음을 뜻하는 리터럴 (`null`, `undefined`). */
function isAbsent(raw: AnyProp): boolean {
    const node = unwrapValue(raw);
    if (node?.type === 'Identifier') return node.name === 'undefined';
    return node?.type === 'Literal' && node.value === null && !node.regex && node.raw === 'null';
}

/**
 * CSS 값이 될 수 없는 리터럴의 종류. 판단에 속성 목록이 필요 없다 — 어떤 속성이든 이 값을
 * 문자열로 바꾼 결과(`"true"`, `"/x/"`, `"1,2"`, 함수 본문)는 유효한 CSS 값이 아니다.
 */
function invalidLiteralKind(raw: AnyProp): string | null {
    const node = unwrapValue(raw);
    switch (node?.type) {
        case 'Literal':
            if (typeof node.value === 'boolean') return 'a boolean';
            if (node.regex) return 'a regular expression';
            if (node.bigint !== undefined) return 'a BigInt';
            return null;
        case 'ArrayExpression':
            return 'an array';
        case 'ArrowFunctionExpression':
        case 'FunctionExpression':
            return 'a function';
        case 'ClassExpression':
            return 'a class';
        default:
            return null;
    }
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

        const cssProperty = hyphenate(name);

        // null / undefined 리터럴 → 선언 없음 (Compiled 와 같은 규칙, TS 의 선택 속성).
        if (isAbsent(value)) return;

        // 어떤 CSS 속성에도 올 수 없는 리터럴 → 빌드 에러. 동적 slot 으로 넘기면 런타임에
        // `"true"` 같은 잘못된 값이 되어 브라우저가 조용히 버린다.
        const invalid = invalidLiteralKind(value);
        if (invalid) {
            pushError(invalidValue(locOf(value), cssProperty, invalid));
            return;
        }

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

        // 동적 shorthand 는 longhand 로 분해하지 않고 원 property 를 유지한다.
        // 런타임 값이 `'8px 16px'` 같은 다중 값일 때 각 longhand 에 전체 값을
        // 복사하면 `padding-top: 8px 16px` 처럼 유효하지 않은 선언이 생겨
        // 해당 longhand 가 초기값(0)으로 떨어진다. shorthand 그대로 두면
        // CSS 가 다중 값을 올바르게 해석한다.
        rules.push({
            kind: 'dynamic',
            property: cssProperty,
            slotId,
            selectorContext,
            sourceExpr,
            start: value.start,
            end: value.end,
        });
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

const invalidValue = (loc: Loc, cssProperty: string, kind: string): BuildError => ({
    code: 'invalid-value',
    message: `"${cssProperty}" is set to ${kind}, which is not a CSS value. Use a string, a number or a token (null / undefined omit the declaration).`,
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
