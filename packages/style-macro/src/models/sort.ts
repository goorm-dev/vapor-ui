// At-rule ordering ported from Atlassian Compiled (Apache-2.0):
// https://github.com/atlassian-labs/compiled/blob/master/packages/css/src/plugins/at-rules/sort-at-rules.ts
//
// `css()` 블록 안에서 at-rule 그룹 순서(min-width 오름 / max-width 내림)를 정한다.

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

export function compareAtRulePath(a: readonly string[], b: readonly string[]): number {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
        const c = compareAtRuleUnit(a[i], b[i]);
        if (c !== 0) return c;
    }
    return a.length - b.length;
}
