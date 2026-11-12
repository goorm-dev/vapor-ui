// Cascade bucket ordering ported from Atlassian Compiled (Apache-2.0):
// https://github.com/atlassian-labs/compiled/blob/master/packages/react/src/runtime/sheet.ts
// https://github.com/atlassian-labs/compiled/blob/master/packages/css/src/plugins/at-rules/sort-at-rules.ts
//
// 단일 시트 안에서 "shorthand < longhand < pseudo(LVFHA) < at-rule" 순서를
// 소스 파일 순서와 무관하게 고정한다.

export const BUCKET_ORDER = [
    's0',
    's1',
    's2',
    's3',
    's4',
    's5',
    'base',
    'link',
    'visited',
    'focus-within',
    'focus',
    'focus-visible',
    'hover',
    'active',
    'at',
] as const;

export type Bucket = (typeof BUCKET_ORDER)[number];

const PSEUDO_BUCKET: Record<string, Bucket> = {
    ':link': 'link',
    ':visited': 'visited',
    ':focus-within': 'focus-within',
    ':focus': 'focus',
    ':focus-visible': 'focus-visible',
    ':hover': 'hover',
    ':active': 'active',
};

/**
 * shorthand 깊이. 숫자가 작을수록 더 넓은 shorthand 이므로 앞에 와야 longhand 가 이긴다.
 * 비어 있는 property 는 longhand(`base`). `padding`/`margin`/`inset`/`border-radius`
 * 는 compile 단계 `expandShorthand` 가 longhand 로 분해하므로 실제로는 거의 안 나온다.
 */
const SHORTHAND_DEPTH: Record<string, number> = {
    all: 0,

    animation: 1,
    background: 1,
    border: 1,
    'border-radius': 1,
    caret: 1,
    columns: 1,
    'column-rule': 1,
    'contain-intrinsic-size': 1,
    container: 1,
    flex: 1,
    'flex-flow': 1,
    font: 1,
    'font-synthesis': 1,
    gap: 1,
    grid: 1,
    'grid-area': 1,
    'grid-gap': 1,
    inset: 1,
    'inset-block': 1,
    'inset-inline': 1,
    'list-style': 1,
    margin: 1,
    'margin-block': 1,
    'margin-inline': 1,
    marker: 1,
    mask: 1,
    offset: 1,
    outline: 1,
    overflow: 1,
    'overscroll-behavior': 1,
    padding: 1,
    'padding-block': 1,
    'padding-inline': 1,
    'place-content': 1,
    'place-items': 1,
    'place-self': 1,
    'position-try': 1,
    'scroll-margin': 1,
    'scroll-margin-block': 1,
    'scroll-margin-inline': 1,
    'scroll-padding': 1,
    'scroll-padding-block': 1,
    'scroll-padding-inline': 1,
    'scroll-timeline': 1,
    'text-decoration': 1,
    'text-emphasis': 1,
    'text-wrap': 1,
    transition: 1,
    'view-timeline': 1,
    'white-space': 1,

    'border-block': 2,
    'border-bottom': 2,
    'border-color': 2,
    'border-image': 2,
    'border-inline': 2,
    'border-left': 2,
    'border-right': 2,
    'border-style': 2,
    'border-top': 2,
    'border-width': 2,
    'font-variant': 2,
    'grid-column': 2,
    'grid-row': 2,
    'grid-template': 2,
    'mask-border': 2,

    'border-block-color': 3,
    'border-block-end': 3,
    'border-block-start': 3,
    'border-block-style': 3,
    'border-block-width': 3,
    'border-inline-color': 3,
    'border-inline-end': 3,
    'border-inline-start': 3,
    'border-inline-style': 3,
    'border-inline-width': 3,
};

export function shorthandDepth(property: string): number | null {
    const d = SHORTHAND_DEPTH[property];
    return d === undefined ? null : d;
}

/** leaf selector(`:hover`, `[data-x]`, `&.a`, `base`) + property → bucket. */
export function bucketOf(leaf: string, hasAtRule: boolean, property: string): Bucket {
    if (hasAtRule) return 'at';
    const pseudo = PSEUDO_BUCKET[leaf];
    if (pseudo) return pseudo;
    const depth = shorthandDepth(property);
    if (depth !== null) return `s${Math.min(depth, 5)}` as Bucket;
    return 'base';
}

export function bucketRank(bucket: Bucket): number {
    return BUCKET_ORDER.indexOf(bucket);
}

/** at-rule 블록 **안**에서의 2차 정렬 — shorthand 깊이 → LVFHA → 나머지. */
export function innerRank(leaf: string, property: string): number {
    const pseudo = PSEUDO_BUCKET[leaf];
    if (pseudo) return 100 + bucketRank(pseudo);
    const depth = shorthandDepth(property);
    if (depth !== null) return depth;
    return 50;
}

// ─── at-rule 비교 ───────────────────────────────────────────────

const OP_RANK: Record<string, number> = { '>': 10, '>=': 20, '<': 30, '<=': 40, '=': 50 };

interface MediaFeature {
    op: string;
    value: number;
}

const LEGACY_RE = /\(\s*(min|max)-width\s*:\s*([\d.]+)\s*(px|em|rem)?\s*\)/gi;
const RANGE_RE = /\(\s*width\s*(<=|>=|<|>|=)\s*([\d.]+)\s*(px|em|rem)?\s*\)/gi;

function toPx(n: string, unit: string | undefined): number {
    const v = Number(n);
    return (unit ?? 'px').toLowerCase() === 'px' ? v : v * 16;
}

function parseMediaFeatures(prelude: string): MediaFeature[] {
    const out: MediaFeature[] = [];
    for (const m of prelude.matchAll(LEGACY_RE)) {
        out.push({ op: m[1].toLowerCase() === 'min' ? '>=' : '<=', value: toPx(m[2], m[3]) });
    }
    for (const m of prelude.matchAll(RANGE_RE)) {
        out.push({ op: m[1], value: toPx(m[2], m[3]) });
    }
    return out;
}

function splitAtRule(unit: string): { name: string; prelude: string } {
    const m = /^@([a-zA-Z-]+)\s*(.*)$/.exec(unit.trim());
    return m ? { name: m[1].toLowerCase(), prelude: m[2] } : { name: unit, prelude: '' };
}

/**
 * Compiled `sortAtRules` 규칙:
 *  - at-rule 이름 알파벳 (`@container` < `@media` < `@supports`)
 *  - 조건 수 적은 것 먼저
 *  - `min-width` 오름차순 (`>`, `>=`) 다음 `max-width` 내림차순 (`<`, `<=`)
 *  - 파싱 불가 prelude 는 파싱 가능한 것보다 앞, 알파벳 순
 */
export function compareAtRuleUnit(a: string, b: string): number {
    const ua = splitAtRule(a);
    const ub = splitAtRule(b);
    if (ua.name !== ub.name) return ua.name < ub.name ? -1 : 1;

    const fa = parseMediaFeatures(ua.prelude);
    const fb = parseMediaFeatures(ub.prelude);
    if (fa.length === 0 || fb.length === 0) {
        if (fa.length === fb.length)
            return ua.prelude < ub.prelude ? -1 : ua.prelude > ub.prelude ? 1 : 0;
        return fa.length === 0 ? -1 : 1;
    }
    if (fa.length !== fb.length) return fa.length - fb.length;

    for (let i = 0; i < fa.length; i++) {
        const x = fa[i];
        const y = fb[i];
        const rx = OP_RANK[x.op] ?? 99;
        const ry = OP_RANK[y.op] ?? 99;
        if (rx !== ry) return rx - ry;
        if (x.value !== y.value) {
            const ascending = x.op === '>' || x.op === '>=';
            return ascending ? x.value - y.value : y.value - x.value;
        }
    }
    return ua.prelude < ub.prelude ? -1 : ua.prelude > ub.prelude ? 1 : 0;
}

export function compareAtRulePath(a: string[], b: string[]): number {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
        const c = compareAtRuleUnit(a[i], b[i]);
        if (c !== 0) return c;
    }
    return a.length - b.length;
}
