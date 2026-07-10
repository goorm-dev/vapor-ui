import type {
    Category,
    Conformant,
    EvaluateOutput,
    EvaluateSummary,
    LlmPassJudgment,
    ScanPayload,
    SchemaMode,
    Violation,
    ViolationType,
} from '~/common/schemas';
import type { TextStyleSchema } from '~/ui/lib/loaders/typography';

import type { LlmColorJudgment, LlmJudgments, LlmTypoJudgment } from './parse';

export type CategoryDet = { violations: Violation[]; conformant: Conformant[]; total: number };

export type MergeArgs = {
    deterministic: Record<Category, CategoryDet>;
    llm: LlmJudgments;
    schemaMode: SchemaMode;
    textStyleSchema: TextStyleSchema;
};

const AXIS_TO_TYPE: Record<LlmTypoJudgment['axis'], ViolationType> = {
    hierarchy: 'typo-hierarchy',
    role: 'typo-role-misfit',
    viewport: 'typo-viewport-misfit',
};

function heuristicTypo(j: LlmTypoJudgment, schema: TextStyleSchema): Violation {
    const known = new Set(schema.order);
    const filtered = j.suggested.filter((s) => known.has(s));
    const message = j.matchedRule ? `[${j.matchedRule}] ${j.reasoning}` : j.reasoning;
    return {
        nodeId: j.nodeId,
        name: j.name,
        property: 'textStyle',
        token: j.token,
        value: null,
        type: AXIS_TO_TYPE[j.axis],
        severity: 'high',
        origin: 'llm',
        message,
        suggested: filtered,
        confidence: j.confidence,
    };
}

function heuristicColor(j: LlmColorJudgment): Violation {
    return {
        nodeId: j.nodeId,
        name: j.name,
        property: j.property,
        token: j.token,
        value: null,
        type: 'semantic-misfit',
        severity: 'high',
        origin: 'llm',
        message: j.reasoning,
        suggested: j.suggested,
        confidence: j.confidence,
    };
}

function summarize(
    violations: Violation[],
    conformant: Conformant[],
    total: number,
): EvaluateSummary {
    const isFail = (v: Violation): boolean =>
        v.severity === 'high' && (v.origin === 'rule' || v.confidence === 'HIGH');
    const high = violations.filter(isFail).length;
    const heuristics = violations.filter((v) => v.origin === 'llm').length;
    const infos = violations.filter(
        (v) => v.severity === 'info' || (v.origin === 'llm' && v.confidence !== 'HIGH'),
    ).length;
    const conformCount = conformant.length;
    const conformanceRate = total > 0 ? (total - high) / total : null;
    return {
        total,
        conformCount,
        conformanceRate,
        highViolations: high,
        infoFlags: infos,
        heuristicViolations: heuristics,
    };
}

function typoPassJudgments(judgments: LlmTypoJudgment[]): LlmPassJudgment[] {
    return judgments
        .filter((j) => j.verdict === 'PASS')
        .map((j) => ({
            nodeId: j.nodeId,
            name: j.name,
            token: j.token,
            axis: j.axis,
            matchedRule: j.matchedRule,
            reasoning: j.reasoning,
            confidence: j.confidence,
        }));
}

export function mergeScanPayload(args: MergeArgs): ScanPayload {
    const { deterministic, llm, schemaMode, textStyleSchema } = args;

    const colorHeuristics = llm.semanticColor
        .filter((j) => j.verdict === 'FAIL')
        .map(heuristicColor);
    const typoHeuristics = llm.typography
        .filter((j) => j.verdict === 'FAIL')
        .map((j) => heuristicTypo(j, textStyleSchema));
    const typoPasses = typoPassJudgments(llm.typography);

    const buildOutput = (
        cat: Category,
        extra: Violation[],
        passJudgments?: LlmPassJudgment[],
    ): EvaluateOutput => {
        const d = deterministic[cat];
        const violations = [...d.violations, ...extra];
        const flagged = new Set(extra.map((v) => `${v.nodeId}:${v.property}`));
        // 각 노드는 독립 판정 대상이므로 그룹 conformant 를 nodeIds 단위로 펼친다.
        // LLM 이 특정 nodeId 만 FAIL 로 뒤집으면 그 노드만 conformant 에서 제외하고 형제는 유지한다.
        const flatConformant: Conformant[] = d.conformant.flatMap((c) => {
            const ids = c.nodeIds && c.nodeIds.length > 0 ? c.nodeIds : [c.nodeId];
            return ids.map((id) => ({ ...c, nodeId: id, nodeIds: [id] }));
        });
        const conformant = flatConformant.filter(
            (c) => !flagged.has(`${c.nodeId}:${c.property}`),
        );
        return {
            violations,
            conformant,
            summary: summarize(violations, conformant, d.total),
            ...(passJudgments && passJudgments.length > 0 ? { passJudgments } : {}),
        };
    };

    return {
        color: buildOutput('color', colorHeuristics),
        space: buildOutput('space', []),
        dimension: buildOutput('dimension', []),
        typography: buildOutput('typography', typoHeuristics, typoPasses),
        borderRadius: buildOutput('borderRadius', []),
        shadow: buildOutput('shadow', []),
        schemaMode,
    };
}
