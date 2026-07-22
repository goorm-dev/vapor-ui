import type {
    ColorUsage,
    DimensionUsage,
    LlmContext,
    NodeInfo,
    RadiusUsage,
    RawExtract,
    ShadowUsage,
    SpaceUsage,
    TypographyUsage,
    Viewport,
} from '~/common/schemas';

import { shouldSkipNode } from './filters';
import { groupBy } from './group-by';
import { captureScreenshot } from './screenshot';
import { detectSchemaMode } from './variables';
import { collectNodeFacts } from './visitor';
import type { NodeFacts, VisitCtx } from './visitor';
import { walkTree } from './walk-tree';

/**
 * root 프레임을 재귀 순회하면서 카테고리별 raw usage 를 수집한다.
 * per-node 로 `collectNodeFacts` 가 { colors, spaces, ... } 를 리턴하면
 * `sink.merge` 로 카테고리별 배열에 병합.
 */
class FactSink {
    colors: (ColorUsage & { nodeId: string })[] = [];
    typography: (TypographyUsage & { nodeId: string })[] = [];
    spaces: SpaceUsage[] = [];
    dimensions: DimensionUsage[] = [];
    radii: RadiusUsage[] = [];
    shadows: ShadowUsage[] = [];
    visited = 0;
    textNodes = 0;

    merge(facts: NodeFacts): void {
        this.colors.push(...facts.colors);
        this.typography.push(...facts.typography);
        this.spaces.push(...facts.spaces);
        this.dimensions.push(...facts.dimensions);
        this.radii.push(...facts.radii);
        this.shadows.push(...facts.shadows);
        this.textNodes += facts.typography.length;
    }
}

async function traverse(node: SceneNode, ctx: VisitCtx, sink: FactSink): Promise<void> {
    if (node.visible === false) return;
    if (shouldSkipNode(node.name)) {
        if ('children' in node) for (const ch of node.children) await traverse(ch, ctx, sink);
        return;
    }
    sink.visited++;
    const facts = await collectNodeFacts(node, ctx);
    sink.merge(facts);
    if ('children' in node) for (const ch of node.children) await traverse(ch, ctx, sink);
}

function inferViewport(width: number): Viewport {
    if (width >= 1024) return 'pc';
    if (width >= 768) return 'tablet';
    return 'mobile';
}

// ---------------------------------------------------------------------------
// Group keys — usage-level dedup 기준.
// ---------------------------------------------------------------------------

const colorKey = (e: ColorUsage & { nodeId: string }): string =>
    JSON.stringify([
        e.name,
        e.property,
        e.token,
        e.hex,
        e.tokenStatus,
        e.background ? e.background.kind : null,
        e.background ? e.background.hex : null,
    ]);

const typographyKey = (e: TypographyUsage & { nodeId: string }): string =>
    JSON.stringify([
        e.name,
        e.characters,
        e.textStyle,
        e.viewport,
        e.appliedStatus,
        e.overriddenFields,
        e.resolved,
    ]);

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

export async function extractFrame(
    frameId: string,
): Promise<{ extract: RawExtract; llmContext: LlmContext }> {
    figma.skipInvisibleInstanceChildren = true;

    const root = await figma.getNodeByIdAsync(frameId);
    if (!root) throw new Error('노드를 찾을 수 없음: ' + frameId);

    const rootScene = root as SceneNode;
    const rootWidth = 'width' in root ? (root as unknown as { width: number }).width : 1024;
    const ctx: VisitCtx = {
        rootId: root.id,
        viewport: inferViewport(rootWidth),
    };
    const schemaMode = await detectSchemaMode(rootScene);

    const sink = new FactSink();
    await traverse(rootScene, ctx, sink);

    const extract: RawExtract = {
        schemaMode,
        viewport: ctx.viewport,
        colors: groupBy(sink.colors, colorKey) as unknown as ColorUsage[],
        typography: groupBy(sink.typography, typographyKey) as unknown as TypographyUsage[],
        spaces: sink.spaces,
        dimensions: sink.dimensions,
        radii: sink.radii,
        shadows: sink.shadows,
        stats: {
            nodeCount: sink.visited,
            textNodes: sink.textNodes,
            visited: sink.visited,
        },
    };

    const [screenshotB64, nodeTree] = await Promise.all([
        captureScreenshot(root as FrameNode).catch(() => ''),
        walkTree(rootScene).catch(() => [] as NodeInfo[]),
    ]);

    return { extract, llmContext: { screenshotB64, nodeTree } };
}

// 기존 테스트가 import 하는 내부 유틸.
export const __testables = { captureScreenshot, walkTree };
