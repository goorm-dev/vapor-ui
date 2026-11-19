// At-rule 출력 순서.
//
// 한 `css()` 블록 안에서 at-rule 은 작성한 순서대로 낸다 — 블록 하나가 CSS 블록 하나인 모델
// (Vanilla Extract, CSS Nesting)에서는 작성 순서가 곧 cascade 의도다.
//
// 예외는 하나다: 같은 형태의 width media query 끼리는 `min-width` 오름(mobile-first) 다음
// `max-width` 내림(desktop-first)으로 정렬한다 (README). 다른 형태의 at-rule 과는 비교할 기준이
// 없으므로 섞지 않는다 — width query 가 차지한 자리 안에서만 순서를 바꾼다.
// width 비교 규칙은 Atlassian Compiled `sortAtRules` 에서 가져왔다 (Apache-2.0):
// https://github.com/atlassian-labs/compiled/blob/master/packages/css/src/plugins/at-rules/sort-at-rules.ts

const OP_RANK: Record<string, number> = { '>': 10, '>=': 20, '<': 30, '<=': 40, '=': 50 };

interface WidthFeature {
    op: string;
    value: number;
}

interface WidthQuery {
    /** width 조건을 뺀 나머지 (media type, 다른 조건). 같아야 비교한다. */
    shape: string;
    features: WidthFeature[];
}

const LEGACY_RE = /\(\s*(min|max)-width\s*:\s*([\d.]+)\s*(px|em|rem)?\s*\)/gi;
const RANGE_RE = /\(\s*width\s*(<=|>=|<|>|=)\s*([\d.]+)\s*(px|em|rem)?\s*\)/gi;

function toPx(n: string, unit: string | undefined): number {
    const v = Number(n);
    return (unit ?? 'px').toLowerCase() === 'px' ? v : v * 16;
}

/** `@media` 의 viewport width 조건. width 조건이 없거나 다른 at-rule 이면 `null`. */
function widthQuery(unit: string): WidthQuery | null {
    const m = /^@media\s+(.*)$/i.exec(unit.trim());
    if (!m) return null;
    const prelude = m[1]!;
    const features: Array<WidthFeature & { at: number }> = [];
    for (const f of prelude.matchAll(LEGACY_RE)) {
        features.push({
            at: f.index!,
            op: f[1]!.toLowerCase() === 'min' ? '>=' : '<=',
            value: toPx(f[2]!, f[3]),
        });
    }
    for (const f of prelude.matchAll(RANGE_RE)) {
        features.push({ at: f.index!, op: f[1]!, value: toPx(f[2]!, f[3]) });
    }
    if (features.length === 0) return null;
    features.sort((a, b) => a.at - b.at);
    const shape = prelude
        .replace(LEGACY_RE, '()')
        .replace(RANGE_RE, '()')
        .replace(/\s+/g, ' ')
        .trim();
    return { shape, features: features.map(({ op, value }) => ({ op, value })) };
}

/** 같은 shape 의 width query 비교. 조건 수가 적은 것 먼저, min 오름 다음 max 내림. */
function compareWidth(a: WidthQuery, b: WidthQuery): number {
    if (a.features.length !== b.features.length) return a.features.length - b.features.length;
    for (let i = 0; i < a.features.length; i++) {
        const x = a.features[i]!;
        const y = b.features[i]!;
        const rx = OP_RANK[x.op] ?? 99;
        const ry = OP_RANK[y.op] ?? 99;
        if (rx !== ry) return rx - ry;
        if (x.value !== y.value) {
            const ascending = x.op === '>' || x.op === '>=';
            return ascending ? x.value - y.value : y.value - x.value;
        }
    }
    return 0;
}

/**
 * at-rule path(바깥 → 안쪽) 목록을 출력 순서로. 입력은 작성 순이다.
 * 바깥 at-rule 이 같은 shape 의 width query 인 path 들만 그 자리들 안에서 정렬하고(안정 정렬,
 * 같으면 작성 순), 나머지는 작성한 자리에 그대로 둔다.
 */
export function orderAtRulePaths<P extends readonly string[]>(paths: P[]): P[] {
    const out = paths.slice();
    const byShape = new Map<string, number[]>();
    const queries = paths.map((p) => (p[0] === undefined ? null : widthQuery(p[0])));
    queries.forEach((q, i) => {
        if (!q) return;
        const slots = byShape.get(q.shape) ?? [];
        slots.push(i);
        byShape.set(q.shape, slots);
    });
    for (const slots of byShape.values()) {
        const sorted = slots
            .slice()
            .sort((a, b) => compareWidth(queries[a]!, queries[b]!) || a - b);
        slots.forEach((slot, k) => {
            out[slot] = paths[sorted[k]!]!;
        });
    }
    return out;
}
