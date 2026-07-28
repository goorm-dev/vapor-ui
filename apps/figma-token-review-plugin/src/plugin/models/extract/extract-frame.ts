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

import { isDsInstance, shouldSkipNode, wasDsComponent } from './filters';
import { groupBy } from './group-by';
import { captureScreenshot } from './screenshot';
import { detectSchemaMode } from './variables';
import { collectNodeFacts } from './visitor';
import type { NodeFacts, OverrideFilter, VisitCtx } from './visitor';
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

/**
 * 💙 DS 인스턴스 아래로 들어갔을 때 유지되는 감사 문맥.
 * overrideMap: 해당 인스턴스와 하위 노드의 override 필드 맵 (`InstanceNode.overrides`).
 * DS 하위 노드는 이 맵에 등재된 필드만 감사 대상이 된다.
 */
type DsScope = { overrideMap: Map<string, ReadonlySet<string>> } | null;

function buildOverrideMap(instance: InstanceNode): Map<string, ReadonlySet<string>> {
    const map = new Map<string, ReadonlySet<string>>();
    const overrides = (
        instance as unknown as {
            overrides?: Array<{ id: string; overriddenFields: string[] }>;
        }
    ).overrides;

    if (!overrides) return map;
    for (const o of overrides) map.set(o.id, new Set(o.overriddenFields));
    return map;
}

function tagWasDs(facts: NodeFacts): void {
    for (const c of facts.colors) c.wasDs = true;
    for (const t of facts.typography) t.wasDs = true;
    for (const s of facts.spaces) s.wasDs = true;
    for (const d of facts.dimensions) d.wasDs = true;
    for (const r of facts.radii) r.wasDs = true;
    for (const s of facts.shadows) s.wasDs = true;
}

async function auditNode(
    node: SceneNode,
    ctx: VisitCtx,
    sink: FactSink,
    filter: OverrideFilter,
): Promise<void> {
    sink.visited++;
    const facts = await collectNodeFacts(node, ctx, filter);
    if (await wasDsComponent(node)) tagWasDs(facts);
    sink.merge(facts);
}

async function traverse(
    node: SceneNode,
    ctx: VisitCtx,
    sink: FactSink,
    scope: DsScope,
): Promise<void> {
    if (node.visible === false) return;

    // 🟨 / 🔶 — 자신은 건너뛰고 자식만 순회.
    if (shouldSkipNode(node.name)) {
        if ('children' in node)
            for (const ch of node.children) await traverse(ch, ctx, sink, scope);
        return;
    }

    // Rule 1 — 💙 DS 인스턴스: override 된 필드만 감사, 하위는 DS scope 진입.
    if (await isDsInstance(node)) {
        const map = buildOverrideMap(node as InstanceNode);
        const selfFields = map.get(node.id) ?? new Set<string>();

        if (selfFields.size > 0) {
            await auditNode(node, ctx, sink, selfFields);
        }

        for (const ch of (node as InstanceNode).children) {
            await traverse(ch, ctx, sink, { overrideMap: map });
        }
        return;
    }

    // Rule 2 — DS 하위에서 프리픽스 없는 인스턴스: 로컬 컴포넌트로 간주해 전체 감사.
    if (scope && node.type === 'INSTANCE') {
        await auditNode(node, ctx, sink, null);
        for (const ch of (node as InstanceNode).children) {
            await traverse(ch, ctx, sink, null);
        }
        return;
    }

    // DS 하위의 구조적(비 인스턴스) 노드: overrideMap 에 등재된 필드만 감사.
    if (scope) {
        const fields = scope.overrideMap.get(node.id);
        if (fields && fields.size > 0) {
            await auditNode(node, ctx, sink, fields);
        }
        if ('children' in node)
            for (const ch of node.children) await traverse(ch, ctx, sink, scope);
        return;
    }

    // 일반 노드: 전체 감사.
    await auditNode(node, ctx, sink, null);
    if ('children' in node) for (const ch of node.children) await traverse(ch, ctx, sink, null);
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
        e.appliedToken ?? null,
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
    await traverse(rootScene, ctx, sink, null);

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

