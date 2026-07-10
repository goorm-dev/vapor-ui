import type { Conformant, NodeInfo, RawExtract, Role } from '~/common/schemas';
import type { ColorSchema } from '~/ui/lib/loaders/color';
import type { TextStyleSchema } from '~/ui/lib/loaders/typography';

export type TypographyTarget = {
    nodeId: string;
    name: string;
    characters: string;
    textStyle: string;
};

export type ColorTarget = {
    nodeId: string;
    name: string;
    property: 'fill' | 'fill-on-text' | 'stroke';
    token: string;
};

export type ColorMetaSubset = {
    when: string[];
    avoid: string[];
    role: Role | null;
    description: string | null;
};

export type TextStyleMetaSubset = {
    rank: number;
    totalRanks: number;
    when: string[];
    avoid: string[];
    description: string | null;
};

export type LlmInput = {
    context: { schemaMode: 'light' | 'dark'; viewport: string; frameName: string };
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
    frameName: string;
    colorSchema: ColorSchema;
    textStyleSchema: TextStyleSchema;
    nodeTree: NodeInfo[];
};

export function buildLlmInput(args: BuildLlmInputArgs): LlmInput {
    const { extract, deterministicConformant, frameName, colorSchema, textStyleSchema, nodeTree } =
        args;

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

    const semanticColorTargets: ColorTarget[] = [];
    const usedColorTokens = new Set<string>();
    for (const conf of deterministicConformant.color) {
        const u = colorByNode.get(conf.nodeId);
        if (!u || !conf.token) continue;
        // 시맨틱 토큰만 의미 판정 대상 (primitive/unknown 제외)
        if (!colorSchema.semantic[conf.token]) continue;
        // conf.property 는 결정론 평가가 이미 property/token 쌍을 정확히 기록한 값.
        // colorByNode 는 nodeId 만으로 키잉하므로 fill/stroke 두 색이 같은 노드에 붙으면
        // 뒤 항목이 앞을 덮어 u.property 가 오염된다. 반드시 conf.property 를 사용해야 함.
        if (
            conf.property !== 'fill' &&
            conf.property !== 'fill-on-text' &&
            conf.property !== 'stroke'
        ) {
            continue;
        }
        semanticColorTargets.push({
            nodeId: conf.nodeId,
            name: u.name,
            property: conf.property,
            token: conf.token,
        });
        usedColorTokens.add(conf.token);
    }

    const typographyTargets: TypographyTarget[] = [];
    for (const conf of deterministicConformant.typography) {
        const u = typoByNode.get(conf.nodeId);
        if (!u || !conf.token) continue;
        typographyTargets.push({
            nodeId: conf.nodeId,
            name: u.name,
            characters: u.characters,
            textStyle: conf.token,
        });
    }

    const colorRubric: Record<string, ColorMetaSubset> = {};
    for (const t of usedColorTokens) {
        const meta = colorSchema.semantic[t];
        if (!meta) continue;
        colorRubric[t] = {
            when: meta.when,
            avoid: meta.avoid,
            role: meta.role,
            description: meta.description,
        };
    }

    const totalRanks = textStyleSchema.order.length;
    const textStyleRubric: Record<string, TextStyleMetaSubset> = {};
    for (const name of textStyleSchema.order) {
        const meta = textStyleSchema.styles[name];
        textStyleRubric[name] = {
            rank: meta.rank,
            totalRanks,
            when: meta.when,
            avoid: meta.avoid,
            description: meta.description,
        };
    }

    return {
        context: { schemaMode: extract.schemaMode, viewport: extract.viewport, frameName },
        judgmentTargets: { typography: typographyTargets, semanticColor: semanticColorTargets },
        rubric: { textStyle: textStyleRubric, color: colorRubric },
        nodeTree,
    };
}
