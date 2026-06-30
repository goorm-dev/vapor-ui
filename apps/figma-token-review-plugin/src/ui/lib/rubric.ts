import type { Conformant, RawExtract, Role } from '~/common/schemas';
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
};

export type BuildLlmInputArgs = {
    extract: RawExtract;
    deterministicConformant: { color: Conformant[]; typography: Conformant[] };
    frameName: string;
    colorSchema: ColorSchema;
    textStyleSchema: TextStyleSchema;
};

export function buildLlmInput(args: BuildLlmInputArgs): LlmInput {
    const { extract, deterministicConformant, frameName, colorSchema, textStyleSchema } = args;

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
        const property: 'fill' | 'fill-on-text' | 'stroke' =
            u.property === 'text' ? 'fill-on-text' : u.property === 'fill' ? 'fill' : 'stroke';
        semanticColorTargets.push({
            nodeId: conf.nodeId,
            name: u.name,
            property,
            token: conf.token,
        });
        usedColorTokens.add(conf.token);
    }

    const typographyTargets: TypographyTarget[] = [];
    const usedTextStyles = new Set<string>();
    for (const conf of deterministicConformant.typography) {
        const u = typoByNode.get(conf.nodeId);
        if (!u || !conf.token) continue;
        typographyTargets.push({
            nodeId: conf.nodeId,
            name: u.name,
            characters: u.characters,
            textStyle: conf.token,
        });
        usedTextStyles.add(conf.token);
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
    for (const t of usedTextStyles) {
        const meta = textStyleSchema.styles[t];
        if (!meta) continue;
        textStyleRubric[t] = {
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
    };
}
