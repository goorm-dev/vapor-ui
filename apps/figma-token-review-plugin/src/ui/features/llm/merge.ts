import type {
    Category,
    Conformant,
    EvaluateOutput,
    EvaluateSummary,
    ScanPayload,
    Violation,
} from '~/common/schemas';

import type { LlmColorJudgment, LlmJudgments, LlmTypoJudgment } from './parse';

export type CategoryDet = { violations: Violation[]; conformant: Conformant[]; total: number };

export type MergeArgs = {
    deterministic: Record<Category, CategoryDet>;
    llm: LlmJudgments;
};

function heuristicTypo(j: LlmTypoJudgment): Violation {
    return {
        nodeId: j.nodeId,
        name: j.name,
        property: 'textStyle',
        token: j.token,
        value: null,
        type: 'typo-hierarchy',
        severity: 'high',
        detail: j.reasoning,
        suggested: j.suggested,
        heuristic: true,
        confidence: j.confidence,
        reasoning: j.reasoning,
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
        detail: j.reasoning,
        suggested: j.suggested,
        heuristic: true,
        confidence: j.confidence,
        reasoning: j.reasoning,
    };
}

function summarize(violations: Violation[], conformant: Conformant[], total: number): EvaluateSummary {
    const isFail = (v: Violation): boolean =>
        v.severity === 'high' && (!v.heuristic || v.confidence === 'HIGH');
    const high = violations.filter(isFail).length;
    const heuristics = violations.filter((v) => v.heuristic).length;
    const infos = violations.filter((v) => v.severity === 'info' || (v.heuristic && v.confidence !== 'HIGH')).length;
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

export function mergeScanPayload(args: MergeArgs): ScanPayload {
    const { deterministic, llm } = args;

    const colorHeuristics = llm.semanticColor.filter((j) => j.verdict === 'FAIL').map(heuristicColor);
    const typoHeuristics = llm.typography.filter((j) => j.verdict === 'FAIL').map(heuristicTypo);

    const buildOutput = (cat: Category, extra: Violation[]): EvaluateOutput => {
        const d = deterministic[cat];
        const violations = [...d.violations, ...extra];
        return {
            violations,
            conformant: d.conformant,
            summary: summarize(violations, d.conformant, d.total),
        };
    };

    return {
        color: buildOutput('color', colorHeuristics),
        space: buildOutput('space', []),
        dimension: buildOutput('dimension', []),
        typography: buildOutput('typography', typoHeuristics),
        borderRadius: buildOutput('borderRadius', []),
        shadow: buildOutput('shadow', []),
    };
}
