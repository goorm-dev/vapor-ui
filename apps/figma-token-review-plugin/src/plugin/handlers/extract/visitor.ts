/* eslint-disable @typescript-eslint/no-explicit-any -- Figma node property access is intentionally loose. */
import type {
    ColorProperty,
    ColorUsage,
    DimensionUsage,
    RadiusUsage,
    ShadowUsage,
    SpaceUsage,
    TokenStatus,
    TypographyUsage,
    Viewport,
} from '~/common/schemas';

import { isVectorLike } from './filters';
import { derivePaddingEmissions } from './padding';
import type { PaddingDir, PaddingField } from './padding';
import { classifyBackground, rgbaToHex, shadowToCss } from './paint';
import { captureTextShot, classifyTextNode } from './text';
import type { TextShot } from './text';
import { readBoundToken, readEffectStyleToken, toToken, walk } from './variables';

/**
 * 단일 노드에서 카테고리별로 추출된 사실 묶음.
 * push-at-end 패턴: 노드 전체 처리가 끝나면 sink 로 한 번에 병합.
 */
export type NodeFacts = {
    colors: (ColorUsage & { nodeId: string })[];
    typography: (TypographyUsage & { nodeId: string })[];
    spaces: SpaceUsage[];
    dimensions: DimensionUsage[];
    radii: RadiusUsage[];
    shadows: ShadowUsage[];
};

export type VisitCtx = {
    /** root frame id — 자기 자신의 width/height 는 dimension 검사 대상 제외. */
    rootId: string;
    viewport: Viewport;
};

const EMPTY_FACTS: NodeFacts = {
    colors: [],
    typography: [],
    spaces: [],
    dimensions: [],
    radii: [],
    shadows: [],
};

/**
 * 노드 하나에 대한 6개 카테고리 사실을 수집한다. 병렬 실행.
 * 순회(자식 traversal) 는 호출부(index.ts) 책임.
 */
export async function collectNodeFacts(node: SceneNode, ctx: VisitCtx): Promise<NodeFacts> {
    const bv: any = (node as any).boundVariables || {};
    const bvRecord = bv as Record<string, { id: string }> | undefined;
    const [colors, typography, spaces, dimensions, radius, shadows] = await Promise.all([
        collectColors(node, bv),
        collectTypography(node, ctx.viewport),
        collectSpaces(node, bvRecord),
        collectDimensions(node, ctx.rootId, bvRecord),
        collectRadius(node, bvRecord),
        collectShadows(node),
    ]);

    return {
        ...EMPTY_FACTS,
        colors,
        typography: typography ? [typography] : [],
        spaces,
        dimensions,
        radii: radius ? [radius] : [],
        shadows,
    };
}

// ---------------------------------------------------------------------------
// Color (fill + stroke). TEXT/벡터 fill 은 'text' 스코프.
// ---------------------------------------------------------------------------

async function collectColors(
    node: SceneNode,
    bv: any,
): Promise<(ColorUsage & { nodeId: string })[]> {
    const fillProperty: ColorProperty =
        node.type === 'TEXT' || isVectorLike(node) ? 'text' : 'fill';

    // TEXT 노드 fill 인 경우에만 PNG 캡처. text-contrast 판정용.
    const textShot = node.type === 'TEXT' ? await captureTextShot(node as TextNode) : undefined;

    const out: (ColorUsage & { nodeId: string })[] = [];

    await extractPaints(
        node,
        (node as TextNode).fills,
        bv.fills || [],
        fillProperty,
        textShot,
        out,
    );
    await extractPaints(
        node,
        (node as TextNode).strokes,
        bv.strokes || [],
        'stroke',
        undefined,
        out,
    );

    return out;
}

async function extractPaints(
    node: SceneNode,
    paints: any,
    bound: any[],
    property: ColorProperty,
    textShot: TextShot | undefined,
    sink: (ColorUsage & { nodeId: string })[],
) {
    const paintList = Array.isArray(paints) ? paints : null;
    const shotFor = property === 'text' && node.type === 'TEXT' ? textShot : undefined;
    const bgFor = property === 'text' ? classifyBackground(node) : null;

    for (let i = 0; i < bound.length; i++) {
        const a = bound[i];
        if (!a || !a.id) continue;

        const p = paintList ? paintList[i] : null;
        if (p && p.visible === false) continue;

        const { chain, finalHex } = await walk(node, a.id);
        const { token, tokenStatus } = toToken(chain);

        sink.push({
            nodeId: node.id,
            name: node.name,
            property,
            token,
            hex: finalHex,
            background: bgFor,
            tokenStatus,
            textShot: shotFor,
        });
    }

    if (!paintList) return;

    paintList.forEach((p: any, i: number) => {
        if (!p || p.type !== 'SOLID' || p.visible === false || bound[i]) return;
        sink.push({
            nodeId: node.id,
            name: node.name,
            property,
            token: null,
            hex: rgbaToHex(p.color),
            background: bgFor,
            tokenStatus: 'raw',
            textShot: shotFor,
        });
    });
}

// ---------------------------------------------------------------------------
// Typography (TEXT 노드 한정)
// ---------------------------------------------------------------------------

async function collectTypography(
    node: SceneNode,
    viewport: Viewport,
): Promise<(TypographyUsage & { nodeId: string }) | null> {
    if (node.type !== 'TEXT') return null;

    const textNode = node as TextNode;
    const { appliedStatus, textStyle, overriddenFields, seg } = await classifyTextNode(textNode);

    return {
        nodeId: node.id,
        name: node.name,
        characters: (textNode.characters || '').slice(0, 20),
        textStyle,
        viewport,
        appliedStatus,
        overriddenFields,
        resolved: {
            fontSize: seg ? seg.fontSize : null,
            lineHeight: seg ? seg.lineHeight : null,
            letterSpacing: seg ? seg.letterSpacing : null,
            fontName: seg ? seg.fontName : null,
        },
    };
}

// ---------------------------------------------------------------------------
// Space (padding + gap)
// ---------------------------------------------------------------------------

const PADDING_FIELDS: readonly PaddingField[] = [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
];

async function collectSpaces(
    node: SceneNode,
    bvRecord: Record<string, { id: string }> | undefined,
): Promise<SpaceUsage[]> {
    const out: SpaceUsage[] = [];

    // padding 4방향 수집 → 최소 표현으로 축약 → 단일 push loop
    const dirs: PaddingDir[] = [];

    for (const f of PADDING_FIELDS) {
        const v = (node as any)[f];
        if (typeof v !== 'number') continue;

        const { token, status } = await readBoundToken(bvRecord, f);
        dirs.push({ field: f, value: v, token, status });
    }

    for (const { property, source } of derivePaddingEmissions(dirs)) {
        out.push({
            nodeId: node.id,
            name: node.name,
            property,
            value: `${source.value}px`,
            token: source.token,
            tokenStatus: source.status,
        });
    }

    // gap (itemSpacing)
    const gapValue = (node as any).itemSpacing;

    if (typeof gapValue === 'number') {
        const { token, status } = await readBoundToken(bvRecord, 'itemSpacing');

        out.push({
            nodeId: node.id,
            name: node.name,
            property: 'gap',
            value: `${gapValue}px`,
            token,
            tokenStatus: status,
        });
    }
    return out;
}

// ---------------------------------------------------------------------------
// Dimension (width + height, FIXED sizing only, non-vector, non-root)
// ---------------------------------------------------------------------------

async function collectDimensions(
    node: SceneNode,
    rootId: string,
    bvRecord: Record<string, { id: string }> | undefined,
): Promise<DimensionUsage[]> {
    if (isVectorLike(node) || node.id === rootId) return [];

    const out: DimensionUsage[] = [];
    const fields = [
        { property: 'width', sizing: 'layoutSizingHorizontal' },
        { property: 'height', sizing: 'layoutSizingVertical' },
    ] as const;

    for (const { property, sizing } of fields) {
        const rawValue: unknown = (node as any)[property];

        if (typeof rawValue !== 'number') continue;
        if ((node as any)[sizing] !== 'FIXED') continue;

        const { token, status } = await readBoundToken(bvRecord, property);

        out.push({
            nodeId: node.id,
            name: node.name,
            property,
            value: `${rawValue}px`,
            token,
            tokenStatus: status,
        });
    }

    return out;
}

// ---------------------------------------------------------------------------
// Border radius (uniform only; figma.mixed per-corner 는 스킵)
// ---------------------------------------------------------------------------

const RADIUS_BINDING_FIELDS = [
    'cornerRadius',
    'topLeftRadius',
    'topRightRadius',
    'bottomLeftRadius',
    'bottomRightRadius',
] as const;

async function collectRadius(
    node: SceneNode,
    bvRecord: Record<string, { id: string }> | undefined,
): Promise<RadiusUsage | null> {
    const cr = (node as FrameNode).cornerRadius;
    if (typeof cr !== 'number') return null;

    // Figma uniform cornerRadius 는 boundVariables.cornerRadius 없이 corner 필드에 바인딩될 수 있어
    // 5개 필드를 우선순위대로 훑는다.
    let token: string | null = null;
    let status: TokenStatus = 'raw';

    for (const cf of RADIUS_BINDING_FIELDS) {
        const r = await readBoundToken(bvRecord, cf);

        if (r.status !== 'raw') {
            token = r.token;
            status = r.status;
            break;
        }
    }

    return {
        nodeId: node.id,
        name: node.name,
        value: `${cr}px`,
        token,
        tokenStatus: status,
    };
}

// ---------------------------------------------------------------------------
// Shadow (effect-style level binding)
// ---------------------------------------------------------------------------

async function collectShadows(node: SceneNode): Promise<ShadowUsage[]> {
    const effects: any[] = Array.isArray((node as any).effects) ? (node as any).effects : [];
    const shadows = effects.filter(
        (eff: any) => eff.type === 'DROP_SHADOW' || eff.type === 'INNER_SHADOW',
    );

    if (shadows.length === 0) return [];

    // 노드당 effectStyleId 는 1개 → 토큰 1회 조회로 모든 shadow 항목이 공유.
    const { token, status } = await readEffectStyleToken(node);
    return shadows.map((eff: any) => ({
        nodeId: node.id,
        name: node.name,
        value: shadowToCss(eff),
        token,
        tokenStatus: status,
    }));
}
