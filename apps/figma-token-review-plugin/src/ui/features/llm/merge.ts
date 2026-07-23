import type {
    Category,
    Conformant,
    EvaluateOutput,
    EvaluateSummary,
    ScanPayload,
    SchemaMode,
    Violation,
    ViolationType,
} from '~/common/schemas';
import type { TextStyleSchema } from '~/ui/lib/loaders/typography';
import type { TargetLookup } from '~/ui/lib/rubric';

import type { LlmColorJudgment, LlmJudgments, LlmTypoJudgment } from './parse';

export type CategoryDet = { violations: Violation[]; conformant: Conformant[]; total: number };

export type { TargetLookup };

export type MergeArgs = {
    deterministic: Record<Category, CategoryDet>;
    llm: LlmJudgments;
    schemaMode: SchemaMode;
    textStyleSchema: TextStyleSchema;
    targets: TargetLookup;
};

const AXIS_TO_TYPE: Record<LlmTypoJudgment['axis'], ViolationType> = {
    hierarchy: 'typo-hierarchy',
    role: 'typo-role-misfit',
};

// LLM 이 FAIL 로 emit 했지만 reasoning 안에서 스스로 "PASS 로 재판단 / emit 불필요" 로 취소하는 경우.
// 프롬프트 위반이지만 실제로 발생하므로 안전망으로 여기서 드롭한다.
const PASS_CANCEL_RE =
    /(pass\s*(?:로|은|는|이|가|처럼|처리|판정)?\s*(?:재판단|판정|처리|해석)|emit\s*(?:불필요|금지|하지\s*(?:마|말|않)))/i;

function isSelfCancelled(reasoning: string): boolean {
    return PASS_CANCEL_RE.test(reasoning);
}

function heuristicTypo(
    j: LlmTypoJudgment,
    schema: TextStyleSchema,
    targets: TargetLookup,
): Violation | null {
    const t = targets.typography.get(j.nodeId);
    if (!t) return null; // target 소실 = LLM 이 없는 nodeId 지어냄. 드롭.
    if (isSelfCancelled(j.reasoning)) return null;

    const known = new Set(schema.order);
    const filtered = j.suggested.filter((s) => known.has(s));
    const message = j.matchedRule ? `[${j.matchedRule}] ${j.reasoning}` : j.reasoning;
    return {
        nodeId: j.nodeId,
        name: targets.nameByNodeId.get(j.nodeId) ?? '',
        property: 'textStyle',
        token: t.textStyle,
        value: null,
        type: AXIS_TO_TYPE[j.axis],
        severity: 'high',
        origin: 'llm',
        message,
        suggested: filtered,
        confidence: j.confidence,
    };
}

function heuristicColor(j: LlmColorJudgment, targets: TargetLookup): Violation | null {
    const key = `${j.nodeId}:${j.property}`;
    const t = targets.color.get(key);
    if (!t) return null;
    if (isSelfCancelled(j.reasoning)) return null;
    return {
        nodeId: j.nodeId,
        name: targets.nameByNodeId.get(j.nodeId) ?? '',
        property: j.property,
        token: t.token,
        value: null,
        type: 'semantic-misfit',
        severity: 'high',
        origin: 'llm',
        message: j.reasoning,
        suggested: j.suggested,
        confidence: j.confidence,
    };
}

const CONFIDENCE_RANK = { HIGH: 3, MED: 2, LOW: 1 } as const;

/**
 * 결정론 evaluator 는 extract 단계에서 groupBy 로 동일 사용처를 한 카드로 묶는다.
 * LLM 은 nodeId 별 개별 target 을 판정하므로 같은 (name, type, property, token) 조합에
 * 여러 nodeId FAIL 이 쏟아지면 카드가 중복된다. 결정론과 동일한 시각적 취급을 위해
 * merge 단계에서 다시 그룹화한다.
 */
function groupLlmViolations(vs: Violation[]): Violation[] {
    const map = new Map<string, Violation>();
    for (const v of vs) {
        const key = `${v.name}|${v.type}|${v.property}|${v.token ?? ''}`;
        const g = map.get(key);
        if (!g) {
            map.set(key, { ...v, nodeIds: [v.nodeId], count: 1, suggested: [...v.suggested] });
            continue;
        }
        g.nodeIds!.push(v.nodeId);
        g.count = (g.count ?? 1) + 1;
        for (const s of v.suggested) if (!g.suggested.includes(s)) g.suggested.push(s);
        const curConf = g.confidence ?? 'LOW';
        const newConf = v.confidence ?? 'LOW';
        if (CONFIDENCE_RANK[newConf] > CONFIDENCE_RANK[curConf]) {
            g.confidence = newConf;
            g.message = v.message; // 대표 message 는 최고 confidence 판정에서 취한다.
        }
    }
    return [...map.values()];
}

function summarize(
    violations: Violation[],
    conformant: Conformant[],
    total: number,
): EvaluateSummary {
    const high = violations.filter((v) => v.severity === 'high').length;
    const infos = violations.filter((v) => v.severity === 'info').length;

    const heuristics = violations.filter((v) => v.origin === 'llm').length;
    const lowConfidence = violations.filter(
        (v) => v.origin === 'llm' && v.confidence !== 'HIGH',
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
        lowConfidenceCount: lowConfidence,
    };
}

export function mergeScanPayload(args: MergeArgs): ScanPayload {
    const { deterministic, llm, schemaMode, textStyleSchema, targets } = args;

    const colorHeuristics = groupLlmViolations(
        llm.semanticColor
            .map((j) => heuristicColor(j, targets))
            .filter((v): v is Violation => v !== null),
    );
    const typoHeuristics = groupLlmViolations(
        llm.typography
            .map((j) => heuristicTypo(j, textStyleSchema, targets))
            .filter((v): v is Violation => v !== null),
    );

    const buildOutput = (cat: Category, extra: Violation[]): EvaluateOutput => {
        const d = deterministic[cat];
        const violations = [...d.violations, ...extra];
        const flagged = new Set<string>();
        for (const v of extra) {
            const ids = v.nodeIds && v.nodeIds.length > 0 ? v.nodeIds : [v.nodeId];
            for (const id of ids) flagged.add(`${id}:${v.property}`);
        }
        // 각 노드는 독립 판정 대상이므로 그룹 conformant 를 nodeIds 단위로 펼친다.
        // LLM 이 특정 nodeId 만 FAIL 로 뒤집으면 그 노드만 conformant 에서 제외하고 형제는 유지한다.
        const flatConformant: Conformant[] = d.conformant.flatMap((c) => {
            const ids = c.nodeIds && c.nodeIds.length > 0 ? c.nodeIds : [c.nodeId];
            return ids.map((id) => ({ ...c, nodeId: id, nodeIds: [id] }));
        });
        const conformant = flatConformant.filter((c) => !flagged.has(`${c.nodeId}:${c.property}`));
        return {
            violations,
            conformant,
            summary: summarize(violations, conformant, d.total),
        };
    };

    return {
        color: buildOutput('color', colorHeuristics),
        space: buildOutput('space', []),
        dimension: buildOutput('dimension', []),
        typography: buildOutput('typography', typoHeuristics),
        borderRadius: buildOutput('borderRadius', []),
        shadow: buildOutput('shadow', []),
        schemaMode,
    };
}
