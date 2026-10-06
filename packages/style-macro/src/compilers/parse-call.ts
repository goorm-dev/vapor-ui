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

function locOf(node: AnyProp): { line: number; column: number } {
    const start = node?.loc?.start;
    return { line: start?.line ?? 1, column: start?.column ?? 0 };
}

/** 리터럴 / 음수 리터럴 / 보간 없는 템플릿 → 값 반환. 아니면 null (dynamic). */
function extractStaticValue(node: AnyProp) {
    if (!node) return null;
    if (node.type === 'Literal') {
        if (typeof node.value === 'string' || typeof node.value === 'number') return node.value;
        return null;
    }
    if (
        node.type === 'UnaryExpression' &&
        node.operator === '-' &&
        node.argument?.type === 'Literal'
    ) {
        if (typeof node.argument.value === 'number') return -node.argument.value;
    }
    if (node.type === 'TemplateLiteral' && node.expressions?.length === 0) {
        return node.quasis?.[0]?.value?.cooked ?? null;
    }
    return null;
}

interface ParseCtx {
    readonly rules: IRRule[];
    readonly errors: BuildError[];
    readonly ternaries: TernarySite[];
    readonly source: string;
}

function errorAt(node: AnyProp, code: BuildError['code'], message: string, ctx: ParseCtx) {
    ctx.errors.push({ code, message, loc: locOf(node) });
}

function walkObject(obj: AnyProp, selectorContext: string, isTop: boolean, ctx: ParseCtx) {
    if (!obj?.properties) return;

    for (const prop of obj.properties) {
        if (prop.type === 'SpreadElement') {
            errorAt(prop, 'spread', 'Spread elements are not supported in css().', ctx);
            continue;
        }
        if (prop.type !== 'Property') {
            errorAt(prop, 'invalid-input-shape', 'Unsupported property node.', ctx);
            continue;
        }
        handleProperty(prop, selectorContext, isTop, ctx);
    }
}

function toKebab(prop: string) {
    if (prop.startsWith('--')) return prop;
    return prop
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
}

function keyName(prop: AnyProp) {
    if (prop.computed) return null;
    if (prop.key?.type === 'Identifier') return prop.key.name;
    if (prop.key?.type === 'Literal' && typeof prop.key.value === 'string') return prop.key.value;
    return null;
}

function handleProperty(prop: AnyProp, selectorContext: string, isTop: boolean, ctx: ParseCtx) {
    if (prop.computed) {
        errorAt(prop.key ?? prop, 'computed-key', 'Computed keys are not supported in css().', ctx);
        return;
    }

    const name = keyName(prop);
    if (name === null) {
        errorAt(prop.key ?? prop, 'computed-key', 'Computed keys are not supported in css().', ctx);
        return;
    }

    const value = prop.value;

    // 중첩 객체 → selector 확장.
    if (value?.type === 'ObjectExpression') {
        handleNestedObject(name, value, selectorContext, prop, ctx);
        return;
    }

    const cssProperty = toKebab(name);

    // 최상위 삼항은 build-time 2-way 로 전개.
    if (isTop && value?.type === 'ConditionalExpression') {
        handleTernary(cssProperty, value, selectorContext, ctx);
        return;
    }

    // 리터럴/토큰이면 static, 아니면 dynamic slot.
    const staticVal = extractStaticValue(value);
    if (staticVal === null) {
        handleDynamic(cssProperty, value, selectorContext, ctx);
        return;
    }

    pushToken(cssProperty, staticVal, selectorContext, locOf(value), ctx);
}

function handleNestedObject(
    name: string,
    value: AnyProp,
    selectorContext: string,
    prop: AnyProp,
    ctx: ParseCtx,
) {
    try {
        parseSelector(name);
    } catch {
        errorAt(
            prop.key ?? prop,
            'invalid-selector',
            `Invalid nested selector "${name}". Must start with ':', '::', '@', '[', or '&'.`,
            ctx,
        );
        return;
    }
    const nextContext = composeContext(selectorContext, name);
    walkObject(value, nextContext, false, ctx);
}

function rangeIndexes(start: number, end: number): number[] {
    const out: number[] = [];
    for (let i = start; i < end; i++) out.push(i);
    return out;
}

/**
 * `color: cond ? '$a' : '$b'` → 양 분기 rule 모두 emit + index 범위 기록.
 * transform.ts 가 이 범위로 삼항식 재작성.
 */
function handleTernary(
    cssProperty: string,
    value: AnyProp,
    selectorContext: string,
    ctx: ParseCtx,
) {
    const conseqLit = extractStaticValue(value.consequent);
    const altLit = extractStaticValue(value.alternate);

    if (conseqLit === null || altLit === null) {
        errorAt(
            value,
            'dynamic-value',
            'Ternary branches must be literals or tokens at the entry-level ternary.',
            ctx,
        );
        return;
    }

    const conseqStart = ctx.rules.length;
    pushToken(cssProperty, conseqLit, selectorContext, locOf(value), ctx);
    const conseqEnd = ctx.rules.length;

    const altStart = ctx.rules.length;
    pushToken(cssProperty, altLit, selectorContext, locOf(value), ctx);
    const altEnd = ctx.rules.length;

    ctx.ternaries.push({
        consequentRuleIndexes: rangeIndexes(conseqStart, conseqEnd),
        alternateRuleIndexes: rangeIndexes(altStart, altEnd),
        testStart: value.test.start,
        testEnd: value.test.end,
    });
}

/** dynamic value 금지 property (값이 식별자여야 함). */
const IDENTIFIER_PROPS = new Set([
    'animation-name',
    'will-change',
    'counter-reset',
    'counter-increment',
    'content',
    'grid-template-areas',
]);

/**
 * 동적 값 → slotId 발급 + DynamicRule emit.
 * transform.ts 가 JSX className 근처에 `style={{...slot: _resolveToken(prop, expr)}}` 주입.
 */
function handleDynamic(
    cssProperty: string,
    value: AnyProp,
    selectorContext: string,
    ctx: ParseCtx,
) {
    if (IDENTIFIER_PROPS.has(cssProperty)) {
        errorAt(
            value,
            'dynamic-value',
            `Dynamic value is not allowed for property "${cssProperty}".`,
            ctx,
        );
        return;
    }

    if (!value || typeof value.start !== 'number' || typeof value.end !== 'number') {
        errorAt(value, 'dynamic-value', `Cannot capture dynamic value for "${cssProperty}".`, ctx);
        return;
    }

    const sourceExpr = ctx.source.slice(value.start, value.end);
    const slotId = generateArbitraryValueSelector(
        `${cssProperty}|${selectorContext}|${sourceExpr}`,
    );

    // shorthand 는 자식 property 전부 동일 slotId 공유.
    for (const e of expandShorthand(cssProperty, `var(--slot-${slotId})`)) {
        ctx.rules.push({
            kind: 'dynamic',
            property: e.property,
            slotId,
            selectorContext,
            sourceExpr,
        });
    }
}

function kebabToCamel(prop: string) {
    return prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

type TokenErrorCode = Extract<
    BuildError['code'],
    'unknown-token' | 'scope-mismatch' | 'unknown-property'
>;

function tokenErrorMessage(code: TokenErrorCode, cssProperty: string, tokenName: string) {
    const token = `$${tokenName}`;

    if (code === 'unknown-token') {
        return [
            '',
            '알 수 없는 토큰입니다.',
            `  - 속성: ${cssProperty}`,
            `  - 토큰: ${token}`,
            `  - 원인: "${cssProperty}" axis 에 "${tokenName}" 토큰이 정의되어 있지 않음.`,
            '',
        ].join('\n');
    }

    if (code === 'scope-mismatch') {
        return [
            '',
            '토큰 scope 가 property 와 일치하지 않습니다.',
            `  - 속성: ${cssProperty}`,
            `  - 토큰: ${token}`,
            `  - 원인: "${token}" 는 다른 axis 소속이라 "${cssProperty}" 에 사용할 수 없음.`,
            '',
        ].join('\n');
    }

    return [
        '',
        '토큰을 지원하지 않는 property 입니다.',
        `  - 속성: ${cssProperty}`,
        `  - 토큰: ${token}`,
        `  - 원인: "${cssProperty}" 는 token scope 가 정의되어 있지 않음 (shorthand 등).`,
        '  - 해결: 전용 sub-property 로 분리 (예: backgroundColor, borderColor, outlineColor).',
        '',
    ].join('\n');
}

const HAS_TOKEN_RE = /\$[a-zA-Z0-9_-]+/;

/**
 * 정적 값 → rule 변환.
 * - standalone `$token` → `resolveToken` 거쳐 CSS var
 * - embedded `$token` (값 일부에 섞여 있음) → **reject** (전용 sub-property 로 분리 요구)
 * - 그 외 → `normalizeValue` 통과
 */
function pushToken(
    cssProperty: string,
    rawValue: string | number,
    selectorContext: string,
    loc: { line: number; column: number },
    ctx: ParseCtx,
) {
    const jsProperty = kebabToCamel(cssProperty);

    if (typeof rawValue === 'string' && HAS_TOKEN_RE.test(rawValue)) {
        const tokenName = rawValue.slice(1);
        const res = resolveToken(jsProperty, tokenName);

        if ('error' in res) {
            ctx.errors.push({
                code: res.error,
                message: tokenErrorMessage(res.error, cssProperty, tokenName),
                loc,
            });
            return;
        }

        emitStatic(cssProperty, res.cssVar, rawValue, selectorContext, ctx);
        return;
    }

    // 비토큰 raw 값 그대로 통과.
    const normalized = normalizeValue({ property: jsProperty, rawValue });
    emitStatic(cssProperty, normalized.css, String(rawValue), selectorContext, ctx);
}

function emitStatic(
    cssProperty: string,
    value: string,
    rawValue: string,
    selectorContext: string,
    ctx: ParseCtx,
) {
    for (const e of expandShorthand(cssProperty, value)) {
        ctx.rules.push({
            kind: 'static',
            property: e.property,
            value: e.value,
            rawValue,
            selectorContext,
        });
    }
}

function createCtx(source: string): ParseCtx {
    return { rules: [], errors: [], ternaries: [], source };
}

export interface ParseCallResult {
    /** IR 목록. 중복 허용 (emit 단계에서 dedupe). */
    rules: IRRule[];
    /** 최상위 삼항 위치. */
    ternaries: TernarySite[];
    /** 이 call 의 build error. */
    errors: BuildError[];
}

export function parseCallArg(arg: AnyProp, source: string): ParseCallResult {
    const ctx = createCtx(source);

    if (!arg || arg.type !== 'ObjectExpression') {
        errorAt(
            arg ?? { loc: undefined },
            'invalid-input-shape',
            'css() requires an object literal argument.',
            ctx,
        );
    } else {
        walkObject(arg, 'base', true, ctx);
    }

    return {
        rules: ctx.rules,
        errors: ctx.errors,
        ternaries: ctx.ternaries,
    };
}
