import type { Conformant, NodeInfo, RawExtract } from '~/common/schemas';
import type { ColorSchema } from '~/ui/lib/loaders/color';
import type { TextStyleSchema } from '~/ui/lib/loaders/typography';

/**
 * TypographyTarget / ColorTarget 은 LLM 응답 재구성 lookup 에도 쓰인다.
 * LLM 은 name/token/textStyle 을 다시 echo 하지 않으므로, merge 는 nodeId(+property) 로
 * 이 target 을 찾아 Violation.token / property 를 복원한다.
 */
export type TypographyTarget = {
    nodeId: string;
    textStyle: string;
};

export type ColorTarget = {
    nodeId: string;
    property: 'fill' | 'fill-on-text' | 'stroke';
    token: string;
};

export type ColorMetaSubset = {
    when: string[];
    avoid: string[];
};

export type TextStyleMetaSubset = {
    rank: number;
    when: string[];
    avoid: string[];
};

export type LlmInput = {
    context: {
        schemaMode: 'light' | 'dark';
        viewport: string;
        totalRanks: number;
    };
    judgmentTargets: { typography: TypographyTarget[]; semanticColor: ColorTarget[] };
    rubric: {
        textStyle: Record<string, TextStyleMetaSubset>;
        color: Record<string, ColorMetaSubset>;
    };
    nodeTree: NodeInfo[];
};

export type BuildLlmInputArgs = {
    extract: RawExtract;
    deterministicConformant: { color: Conformant[]; typography: Conformant[] };
    colorSchema: ColorSchema;
    textStyleSchema: TextStyleSchema;
    nodeTree: NodeInfo[];
};

/**
 * merge 가 LLM 응답의 nodeId(+property) → target(=token 등) 을 되찾기 위한 lookup.
 * runLlmEvaluation 안에서 buildLlmInput 과 함께 만들어 mergeScanPayload 로 넘겨진다.
 */
export type TargetLookup = {
    typography: Map<string, TypographyTarget>;
    color: Map<string, ColorTarget>;
    nameByNodeId: Map<string, string>;
};

export type BuildLlmInputResult = {
    input: LlmInput;
    targets: TargetLookup;
};

export function buildLlmInput(args: BuildLlmInputArgs): BuildLlmInputResult {
    const { extract, deterministicConformant, colorSchema, textStyleSchema, nodeTree } = args;

    // After groupBy in extract.ts, items have nodeIds: string[] instead of nodeId.
    // Build a map from each individual nodeId to its grouped entry.
    const colorByNode = new Map<string, (typeof extract.colors)[number]>();
    for (const c of extract.colors) {
        const ids = c.nodeIds ?? (c.nodeId ? [c.nodeId] : []);
        for (const id of ids) colorByNode.set(id, c);
    }
    const typoByNode = new Map<string, (typeof extract.typography)[number]>();
    for (const t of extract.typography) {
        const ids = t.nodeIds ?? (t.nodeId ? [t.nodeId] : []);
        for (const id of ids) typoByNode.set(id, t);
    }

    const nameByNodeId = new Map<string, string>();
    for (const [id, entry] of colorByNode) nameByNodeId.set(id, entry.name);
    for (const [id, entry] of typoByNode) nameByNodeId.set(id, entry.name);

    const semanticColorTargets: ColorTarget[] = [];
    const colorTargetIndex = new Map<string, ColorTarget>();
    const usedColorTokens = new Set<string>();
    for (const conf of deterministicConformant.color) {
        const u = colorByNode.get(conf.nodeId);
        if (!u || !conf.token) continue;
        if (!colorSchema.semantic[conf.token]) continue;
        if (
            conf.property !== 'fill' &&
            conf.property !== 'fill-on-text' &&
            conf.property !== 'stroke'
        ) {
            continue;
        }
        const ids = conf.nodeIds && conf.nodeIds.length > 0 ? conf.nodeIds : [conf.nodeId];
        for (const id of ids) {
            const target: ColorTarget = {
                nodeId: id,
                property: conf.property,
                token: conf.token,
            };
            semanticColorTargets.push(target);
            colorTargetIndex.set(`${id}:${conf.property}`, target);
        }
        usedColorTokens.add(conf.token);
    }

    const typographyTargets: TypographyTarget[] = [];
    const typoTargetIndex = new Map<string, TypographyTarget>();
    for (const conf of deterministicConformant.typography) {
        const u = typoByNode.get(conf.nodeId);
        if (!u || !conf.token) continue;
        const ids = conf.nodeIds && conf.nodeIds.length > 0 ? conf.nodeIds : [conf.nodeId];
        for (const id of ids) {
            const target: TypographyTarget = { nodeId: id, textStyle: conf.token };
            typographyTargets.push(target);
            typoTargetIndex.set(id, target);
        }
    }

    const colorRubric: Record<string, ColorMetaSubset> = {};
    for (const t of usedColorTokens) {
        const meta = colorSchema.semantic[t];
        if (!meta) continue;
        colorRubric[t] = {
            when: meta.when,
            avoid: meta.avoid,
        };
    }

    const totalRanks = textStyleSchema.order.length;
    const textStyleRubric: Record<string, TextStyleMetaSubset> = {};
    for (const name of textStyleSchema.order) {
        const meta = textStyleSchema.styles[name];
        textStyleRubric[name] = {
            rank: meta.rank,
            when: meta.when,
            avoid: meta.avoid,
        };
    }

    const input: LlmInput = {
        context: {
            schemaMode: extract.schemaMode,
            viewport: extract.viewport,
            totalRanks,
        },
        judgmentTargets: { typography: typographyTargets, semanticColor: semanticColorTargets },
        rubric: { textStyle: textStyleRubric, color: colorRubric },
        nodeTree,
    };

    return {
        input,
        targets: {
            typography: typoTargetIndex,
            color: colorTargetIndex,
            nameByNodeId,
        },
    };
}
