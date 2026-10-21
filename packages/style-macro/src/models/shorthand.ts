type Expansion = (value: string) => Array<{ property: string; value: string }>;

/**
 * CSS value 를 괄호 밖 공백 기준으로 토큰 split.
 * `var(--a) var(--b)` → `['var(--a)', 'var(--b)']`
 * `calc(1px + 2px) 2px` → `['calc(1px + 2px)', '2px']`
 */
function splitCssValue(v: string): string[] {
    const trimmed = v.trim();
    const parts: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < trimmed.length; i++) {
        const c = trimmed[i];
        if (c === '(') depth++;
        else if (c === ')') depth--;
        else if (
            depth === 0 &&
            (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f')
        ) {
            if (i > start) parts.push(trimmed.slice(start, i));
            start = i + 1;
        }
    }
    if (start < trimmed.length) parts.push(trimmed.slice(start));
    return parts.length > 0 ? parts : [trimmed];
}

/** CSS 1-to-4 value box 규칙: [T, R, B, L]. */
function fourSides(v: string): [string, string, string, string] {
    const p = splitCssValue(v);
    const t = p[0];
    const r = p[1] ?? t;
    const b = p[2] ?? t;
    const l = p[3] ?? r;
    return [t, r, b, l];
}

/** CSS 1-to-2 value 규칙 (block/inline, start/end). */
function twoSides(v: string): [string, string] {
    const p = splitCssValue(v);
    const a = p[0];
    const b = p[1] ?? a;
    return [a, b];
}

const TABLE: Record<string, Expansion> = {
    padding: (v) => {
        const [t, r, b, l] = fourSides(v);
        return [
            { property: 'padding-top', value: t },
            { property: 'padding-right', value: r },
            { property: 'padding-bottom', value: b },
            { property: 'padding-left', value: l },
        ];
    },
    margin: (v) => {
        const [t, r, b, l] = fourSides(v);
        return [
            { property: 'margin-top', value: t },
            { property: 'margin-right', value: r },
            { property: 'margin-bottom', value: b },
            { property: 'margin-left', value: l },
        ];
    },
    'padding-inline': (v) => {
        const [s, e] = twoSides(v);
        return [
            { property: 'padding-inline-start', value: s },
            { property: 'padding-inline-end', value: e },
        ];
    },
    'padding-block': (v) => {
        const [s, e] = twoSides(v);
        return [
            { property: 'padding-block-start', value: s },
            { property: 'padding-block-end', value: e },
        ];
    },
    'margin-inline': (v) => {
        const [s, e] = twoSides(v);
        return [
            { property: 'margin-inline-start', value: s },
            { property: 'margin-inline-end', value: e },
        ];
    },
    'margin-block': (v) => {
        const [s, e] = twoSides(v);
        return [
            { property: 'margin-block-start', value: s },
            { property: 'margin-block-end', value: e },
        ];
    },
    inset: (v) => {
        const [t, r, b, l] = fourSides(v);
        return [
            { property: 'top', value: t },
            { property: 'right', value: r },
            { property: 'bottom', value: b },
            { property: 'left', value: l },
        ];
    },
    'inset-inline': (v) => {
        const [s, e] = twoSides(v);
        return [
            { property: 'inset-inline-start', value: s },
            { property: 'inset-inline-end', value: e },
        ];
    },
    'inset-block': (v) => {
        const [s, e] = twoSides(v);
        return [
            { property: 'inset-block-start', value: s },
            { property: 'inset-block-end', value: e },
        ];
    },
    'border-radius': (v) => {
        // border-radius 는 축소형이 TL / TR / BR / BL 순서 (padding 과 대각선 방향 다름).
        const p = splitCssValue(v);
        // elliptical corner 구문(`10px 5px / 20px`)이나 `!important` 플래그가
        // 섞여 있으면 토큰 단위로 쪼개면 안 된다. 원 property 를 그대로 유지.
        if (p.length > 4 || p.some((t) => t === '/' || t.startsWith('!'))) {
            return [{ property: 'border-radius', value: v }];
        }
        const tl = p[0];
        const tr = p[1] ?? tl;
        const br = p[2] ?? tl;
        const bl = p[3] ?? tr;
        return [
            { property: 'border-top-left-radius', value: tl },
            { property: 'border-top-right-radius', value: tr },
            { property: 'border-bottom-right-radius', value: br },
            { property: 'border-bottom-left-radius', value: bl },
        ];
    },
};

export function expandShorthand(property: string, value: string) {
    const fn = TABLE[property];
    if (fn) return fn(value);
    return [{ property, value }];
}
