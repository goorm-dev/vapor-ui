import type {
    AnyExtractionRule,
    ExtractCtx,
    NodeFacts,
    OverrideFilter,
    RuleTrace,
} from './types';

export const passes = (filter: OverrideFilter, ...keys: readonly string[]): boolean =>
    filter === null || keys.some((k) => filter.has(k));

const emptyFacts = (): NodeFacts => ({
    colors: [],
    typography: [],
    spaces: [],
    dimensions: [],
    radii: [],
    shadows: [],
});

type RuleOutcome = {
    rule: AnyExtractionRule;
    emissions: object[];
    trace: RuleTrace | null;
};

async function runOne(
    node: SceneNode,
    ctx: ExtractCtx,
    rule: AnyExtractionRule,
    collectTrace: boolean,
): Promise<RuleOutcome> {
    if (!passes(ctx.filter, ...rule.filterKeys)) {
        return { rule, emissions: [], trace: collectTrace ? { rule: rule.name, skipped: 'filter' } : null };
    }

    const failed = (rule.guards ?? []).find((g) => !g.test(node, ctx));
    if (failed) {
        return {
            rule,
            emissions: [],
            trace: collectTrace ? { rule: rule.name, skipped: `guard:${failed.name}` } : null,
        };
    }

    try {
        const emissions = await rule.extract(node, ctx);
        return {
            rule,
            emissions,
            trace: collectTrace ? { rule: rule.name, emitted: emissions.length } : null,
        };
    } catch (err) {
        // 규칙 하나의 실패가 노드 전체 추출을 죽이지 않는다.
        const msg = err instanceof Error ? err.message : String(err);
        if (!collectTrace) {
            // trace off 여도 규칙 실패는 관측 가능해야 함
            console.warn(`[extract] rule "${rule.name}" failed on node ${node.id}:`, msg);
        }
        return {
            rule,
            emissions: [],
            trace: collectTrace ? { rule: rule.name, error: msg } : null,
        };
    }
}

/**
 * 규칙 테이블 실행: 필터 → 가드 → extract → nodeId/name 스탬핑 → 병합.
 * 규칙은 병렬 실행하되 병합은 테이블 순서 — 결과 순서가 결정적이어야 downstream dedup 이 안정적.
 */
export async function runRules(
    node: SceneNode,
    ctx: ExtractCtx,
    rules: readonly AnyExtractionRule[],
    options: { trace?: boolean } = {},
): Promise<{ facts: NodeFacts; trace: RuleTrace[] }> {
    const collectTrace = options.trace === true;
    const outcomes = await Promise.all(rules.map((r) => runOne(node, ctx, r, collectTrace)));

    const facts = emptyFacts();
    const trace: RuleTrace[] = [];

    for (const { rule, emissions, trace: t } of outcomes) {
        if (t) trace.push(t);
        for (const e of emissions) {
            (facts[rule.category] as object[]).push({ nodeId: node.id, name: node.name, ...e });
        }
    }

    return { facts, trace };
}
