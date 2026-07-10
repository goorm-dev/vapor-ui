/* eslint-disable @typescript-eslint/no-explicit-any -- 1:1 mechanical port of .claude/skills/figma-token-review/scripts/extract.figma.js. Variable-alias chains, Figma paint shapes and `valuesByMode` lookups are intentionally untyped here to mirror the source. */
import type {
    ColorBackground,
    ColorProperty,
    ColorUsage,
    DimensionUsage,
    LlmContext,
    NodeInfo,
    RadiusUsage,
    RawExtract,
    SchemaMode,
    ShadowUsage,
    SpaceUsage,
    TokenStatus,
    TypographyUsage,
    Viewport,
} from '~/common/schemas';

const MODE: 'both' | 'color' | 'typography' = 'both';

const SKIP_PREFIXES = ['🟨', '🔶'] as const;

function shouldSkipNode(name: string): boolean {
    return SKIP_PREFIXES.some((p) => name.startsWith(p));
}

function sameLineHeight(a: LineHeight | undefined, b: LineHeight | undefined): boolean {
    if (!a || !b) return a === b;
    if (a.unit !== b.unit) return false;
    if (a.unit === 'AUTO' || b.unit === 'AUTO') return a.unit === b.unit;
    return a.value === b.value;
}

function tierOf(collName: string | null): string {
    if (!collName) return 'unknown';
    if (collName.includes('⚙️') || /primitive/i.test(collName)) return 'primitive';
    if (collName.includes('●') || /(^|[^a-z])token(\/|$| )/i.test(collName)) return 'semantic';
    if (collName.includes('💙') || /\/Color$/i.test(collName)) return 'component';
    return 'unknown';
}

function rgbaToHex(c: any): string | null {
    if (!c) return null;
    const f = (n: number) =>
        Math.round(n * 255)
            .toString(16)
            .padStart(2, '0');
    return '#' + f(c.r) + f(c.g) + f(c.b);
}

function toSchemaKey(name: string | null): string | null {
    // Figma semantic color variable names are already in the new key format (e.g. "color-background-primary-100")
    return name && name.startsWith('color-') ? name : null;
}

/** Strip a leading "<prefix>/" from a Figma variable/style name; otherwise return verbatim.
 * Examples:
 *   "size/size-space-200" → "size-space-200"
 *   "color/color-background-primary-100" → "color-background-primary-100"
 *   "shadow/shadow-md" → "shadow-md"
 *   "already-clean-200" → "already-clean-200"
 */
function stripLeadingPrefix(name: string): string {
    const idx = name.indexOf('/');
    return idx === -1 ? name : name.substring(idx + 1);
}

/** Resolve a single boundVariable ref to a token key. Returns null + 'raw' if no binding. */
async function readBoundToken(
    bound: Record<string, { id: string }> | undefined,
    field: string,
): Promise<{ token: string | null; status: TokenStatus }> {
    const ref = bound?.[field];
    if (!ref) return { token: null, status: 'raw' };
    const variable = await getVariableWithRemoteDefense(ref.id);
    if (!variable) return { token: null, status: 'unknown' };
    return { token: stripLeadingPrefix(variable.name), status: 'ok' };
}

/**
 * Resolve shadow token via effectStyleId.
 * Figma shadows bind at the effect-style level, not via per-effect boundVariables.
 * If an effectStyleId is present, derive the token key from the style name.
 * Otherwise mark as 'raw'.
 * NOTE: This assumes the effect style name matches the shadow schema key format
 * (e.g. "shadow/md" → "shadow.md"). Validate in T13 smoke.
 */
async function readEffectStyleToken(
    node: SceneNode,
): Promise<{ token: string | null; status: TokenStatus }> {
    const styleId: string | undefined = (node as any).effectStyleId;
    if (!styleId) return { token: null, status: 'raw' };
    try {
        const style = await figma.getStyleByIdAsync(styleId);
        if (!style) return { token: null, status: 'unknown' };
        return { token: stripLeadingPrefix(style.name), status: 'ok' };
    } catch (_e) {
        return { token: null, status: 'unknown' };
    }
}

/** Stringify a Figma RGBA color to CSS rgba() string. */
function rgbaToString(c: any): string {
    if (!c) return 'rgba(0,0,0,1)';
    const r = Math.round(c.r * 255);
    const g = Math.round(c.g * 255);
    const b = Math.round(c.b * 255);
    const a = typeof c.a === 'number' ? c.a : 1;
    return `rgba(${r},${g},${b},${a})`;
}

/** Convert a Figma DROP_SHADOW or INNER_SHADOW effect to a CSS box-shadow string. */
function shadowToCss(eff: any): string {
    const inset = eff.type === 'INNER_SHADOW' ? 'inset ' : '';
    const x = Math.round(eff.offset?.x ?? 0);
    const y = Math.round(eff.offset?.y ?? 0);
    const blur = Math.round(eff.radius ?? 0);
    const spread = Math.round(eff.spread ?? 0);
    const color = rgbaToString(eff.color);
    return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

async function getVariableWithRemoteDefense(id: string): Promise<any> {
    let v: any = null;
    try {
        v = await figma.variables.getVariableByIdAsync(id);
    } catch (_e) {
        v = null;
    }
    if (v && v.remote) {
        try {
            const imported = await figma.variables.importVariableByKeyAsync(v.key);
            if (imported) v = imported;
        } catch (_e) {
            /* 실패 시 원본 유지 — 체인이 끊기면 'unknown'으로 떨어진다 */
        }
    }
    return v;
}

async function walk(
    node: SceneNode,
    startId: string,
): Promise<{ chain: { name: string; tier: string }[]; finalHex: string | null }> {
    const modes: Record<string, string> = (node as any).resolvedVariableModes || {};
    const chain: { name: string; tier: string }[] = [];
    const seen = new Set<string>();
    let id: string | null = startId;
    let finalHex: string | null = null;
    while (id && !seen.has(id)) {
        seen.add(id);
        const v = await getVariableWithRemoteDefense(id);
        if (!v) break;
        let collName: string | null = null;
        try {
            const coll = await figma.variables.getVariableCollectionByIdAsync(
                v.variableCollectionId,
            );
            collName = coll && coll.name;
        } catch (_e) {
            collName = null;
        }
        chain.push({ name: v.name, tier: tierOf(collName) });
        const m = modes[v.variableCollectionId] || Object.keys(v.valuesByMode)[0];
        const val = v.valuesByMode[m];
        if (val && val.type === 'VARIABLE_ALIAS') id = val.id;
        else {
            finalHex = rgbaToHex(val);
            id = null;
        }
    }
    return { chain, finalHex };
}

function toToken(chain: { name: string; tier: string }[]): {
    token: string | null;
    tokenStatus: TokenStatus;
} {
    const sem = chain.find((c) => c.tier === 'semantic');
    if (!sem) return { token: null, tokenStatus: 'unknown' };
    const key = toSchemaKey(sem.name);
    return key ? { token: key, tokenStatus: 'ok' } : { token: null, tokenStatus: 'unknown' };
}

function isVisiblePaint(p: any): boolean {
    return !!p && p.visible !== false;
}

function classifyBackground(node: SceneNode): ColorBackground {
    let cur: any = node.parent;
    while (cur && cur.type !== 'PAGE') {
        const nodeOpaque = ('opacity' in cur ? cur.opacity : 1) === 1;
        const fills = 'fills' in cur && Array.isArray(cur.fills) ? cur.fills : [];
        const visible = fills.find(isVisiblePaint);
        if (visible) {
            if (visible.type !== 'SOLID') return { kind: 'ambiguous', hex: null };
            const fillOpaque = (visible.opacity ?? 1) === 1;
            if (!nodeOpaque || !fillOpaque)
                return { kind: 'ambiguous', hex: rgbaToHex(visible.color) };
            const hex = rgbaToHex(visible.color);
            return { kind: hex === '#ffffff' ? 'white' : 'other', hex };
        }
        cur = cur.parent;
    }
    return { kind: 'transparent', hex: null };
}

async function detectSchemaMode(node: SceneNode): Promise<SchemaMode> {
    const modes: Record<string, string> = (node as any).resolvedVariableModes || {};
    for (const collId of Object.keys(modes)) {
        try {
            const coll = await figma.variables.getVariableCollectionByIdAsync(collId);
            const m = coll && coll.modes.find((x: any) => x.modeId === modes[collId]);
            if (m && /dark/i.test(m.name)) return 'dark';
        } catch (_e) {
            /* 무시 — light 기본 */
        }
    }
    return 'light';
}

async function classifyTextNode(node: TextNode): Promise<{
    appliedStatus: 'styled-clean' | 'styled-override' | 'var-only' | 'raw' | 'mixed';
    textStyle: string | null;
    overriddenFields: string[];
    seg: any;
}> {
    const segs = node.getStyledTextSegments([
        'textStyleId',
        'fontName',
        'fontSize',
        'lineHeight',
        'letterSpacing',
        'boundVariables',
    ]);

    if (segs.length > 1)
        return {
            appliedStatus: 'mixed',
            textStyle: null,
            overriddenFields: [],
            seg: segs[0],
        };

    const seg = segs[0];
    const styleId = seg && seg.textStyleId;

    if (styleId) {
        const style: any = await figma.getStyleByIdAsync(styleId).catch(() => null);
        if (!style)
            return {
                appliedStatus: 'styled-clean',
                textStyle: null,
                overriddenFields: [],
                seg,
            };
        const overriddenFields: string[] = [];
        if (
            seg.fontName?.family !== style.fontName?.family ||
            seg.fontName?.style !== style.fontName?.style
        )
            overriddenFields.push('fontName');
        if (seg.fontSize !== style.fontSize) overriddenFields.push('fontSize');
        if (!sameLineHeight(seg.lineHeight, style.lineHeight)) overriddenFields.push('lineHeight');
        if (
            seg.letterSpacing?.unit !== style.letterSpacing?.unit ||
            seg.letterSpacing?.value !== style.letterSpacing?.value
        )
            overriddenFields.push('letterSpacing');
        return {
            appliedStatus: overriddenFields.length ? 'styled-override' : 'styled-clean',
            textStyle: style.name,
            overriddenFields,
            seg,
        };
    }

    const bv: any = (seg && seg.boundVariables) || {};
    const hasBinding = Object.keys(bv).some((k) =>
        ['fontFamily', 'fontSize', 'fontStyle', 'lineHeight', 'letterSpacing'].includes(k),
    );
    return {
        appliedStatus: hasBinding ? 'var-only' : 'raw',
        textStyle: null,
        overriddenFields: [],
        seg,
    };
}

function groupBy<T extends { nodeId: string }>(
    items: T[],
    keyOf: (item: T) => string,
): (T & { nodeIds: string[]; count: number })[] {
    const map = new Map<string, any>();
    for (const it of items) {
        const key = keyOf(it);
        const g = map.get(key);
        if (g) {
            g.nodeIds.push(it.nodeId);
            g.count++;
        } else {
            map.set(key, { ...it, nodeIds: [it.nodeId], count: 1 });
        }
    }
    return [...map.values()];
}

async function captureScreenshot(frame: FrameNode): Promise<string> {
    const bytes = await frame.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 1 },
    });
    return figma.base64Encode(bytes);
}

async function walkTree(root: SceneNode): Promise<NodeInfo[]> {
    const out: NodeInfo[] = [];
    const stack: Array<{ node: SceneNode; parentId: string | null }> = [
        { node: root, parentId: null },
    ];
    while (stack.length) {
        const { node, parentId } = stack.pop()!;
        const children = 'children' in node ? (node.children as readonly SceneNode[]) : [];
        if (shouldSkipNode(node.name)) {
            for (const c of children) stack.push({ node: c, parentId });
            continue;
        }

        const info: NodeInfo = {
            id: node.id,
            type: node.type,
            name: node.name,
            parentId,
            childIds: children.map((c) => c.id),
            x: 'x' in node ? (node as { x: number }).x : 0,
            y: 'y' in node ? (node as { y: number }).y : 0,
            w: 'width' in node ? (node as { width: number }).width : 0,
            h: 'height' in node ? (node as { height: number }).height : 0,
        };

        if (node.type === 'TEXT') {
            const textNode = node as TextNode;
            info.characters = (textNode.characters || '').slice(0, 60);
            try {
                const { textStyle } = await classifyTextNode(textNode);
                if (textStyle) info.textStyle = textStyle;
            } catch {
                // Skip textStyle on failure; characters still surfaces.
            }
        }

        out.push(info);
        for (const c of children) stack.push({ node: c, parentId: node.id });
    }
    return out;
}

export const __testables = { captureScreenshot, walkTree };

export async function extractFrame(
    frameId: string,
): Promise<{ extract: RawExtract; llmContext: LlmContext }> {
    figma.skipInvisibleInstanceChildren = true;

    const root = await figma.getNodeByIdAsync(frameId);
    if (!root) throw new Error('노드를 찾을 수 없음: ' + frameId);

    const colorRaw: (ColorUsage & { nodeId: string })[] = [];
    const typoRaw: (TypographyUsage & { nodeId: string })[] = [];
    const spaceRaw: SpaceUsage[] = [];
    const dimensionRaw: DimensionUsage[] = [];
    const radiusRaw: RadiusUsage[] = [];
    const shadowRaw: ShadowUsage[] = [];
    let visited = 0;
    let textNodes = 0;

    const rootWidth = 'width' in root ? (root as any).width : 1024;
    const viewport: Viewport = rootWidth >= 1024 ? 'pc' : rootWidth >= 768 ? 'tablet' : 'mobile';

    const schemaMode: SchemaMode = await detectSchemaMode(root as SceneNode);

    function pushColor(
        node: SceneNode,
        property: ColorProperty,
        token: string | null,
        hex: string | null,
        tokenStatus: TokenStatus,
    ): void {
        colorRaw.push({
            nodeId: node.id,
            name: node.name,
            property,
            token,
            hex,
            background: property === 'text' ? classifyBackground(node) : null,
            tokenStatus,
        });
    }

    async function visit(node: SceneNode): Promise<void> {
        if (shouldSkipNode(node.name)) {
            if ('children' in node) for (const ch of node.children) await visit(ch);
            return;
        }
        visited++;
        const bv: any = (node as any).boundVariables || {};
        const fillProperty: ColorProperty =
            node.type === 'TEXT' || node.type === 'VECTOR' ? 'text' : 'fill';

        if (MODE !== 'typography') {
            const extractPaints = async (
                paints: any,
                bound: any[],
                property: ColorProperty,
            ): Promise<void> => {
                const paintList = Array.isArray(paints) ? paints : null;
                for (let i = 0; i < bound.length; i++) {
                    const a = bound[i];
                    if (!a || !a.id) continue;
                    const p = paintList ? paintList[i] : null;
                    if (p && p.visible === false) continue;
                    const { chain, finalHex } = await walk(node, a.id);
                    const { token, tokenStatus } = toToken(chain);
                    pushColor(node, property, token, finalHex, tokenStatus);
                }
                if (paintList) {
                    paintList.forEach((p: any, i: number) => {
                        if (p && p.type === 'SOLID' && p.visible !== false && !bound[i]) {
                            pushColor(node, property, null, rgbaToHex(p.color), 'raw');
                        }
                    });
                }
            };
            await extractPaints((node as any).fills, bv.fills || [], fillProperty);
            await extractPaints((node as any).strokes, bv.strokes || [], 'stroke');
        }

        if (MODE !== 'color' && node.type === 'TEXT') {
            textNodes++;
            const { appliedStatus, textStyle, overriddenFields, seg } =
                await classifyTextNode(node);
            typoRaw.push({
                nodeId: node.id,
                name: node.name,
                characters: (node.characters || '').slice(0, 20),
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
            });
        }

        // — Space (padding + gap) —
        const bvRecord = bv as Record<string, { id: string }> | undefined;

        // Collect 4 padding directions
        type PaddingDir = {
            field: string;
            value: number;
            token: string | null;
            status: TokenStatus;
        };
        const paddingDirs: PaddingDir[] = [];
        for (const f of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const) {
            const v = (node as any)[f];
            if (typeof v === 'number') {
                const { token, status } = await readBoundToken(bvRecord, f);
                paddingDirs.push({ field: f, value: v, token, status });
            }
        }

        if (paddingDirs.length > 0) {
            const allSame =
                paddingDirs.length === 4 &&
                paddingDirs.every(
                    (d) =>
                        d.value === paddingDirs[0].value &&
                        d.token === paddingDirs[0].token &&
                        d.status === paddingDirs[0].status,
                );

            if (allSame) {
                // Uniform padding: emit one 'padding' entry
                spaceRaw.push({
                    nodeId: node.id,
                    name: node.name,
                    property: 'padding',
                    value: `${paddingDirs[0].value}px`,
                    token: paddingDirs[0].token,
                    tokenStatus: paddingDirs[0].status,
                });
            } else {
                const top = paddingDirs.find((d) => d.field === 'paddingTop');
                const bot = paddingDirs.find((d) => d.field === 'paddingBottom');
                const left = paddingDirs.find((d) => d.field === 'paddingLeft');
                const right = paddingDirs.find((d) => d.field === 'paddingRight');
                const vertEq =
                    top &&
                    bot &&
                    top.value === bot.value &&
                    top.token === bot.token &&
                    top.status === bot.status;
                const horzEq =
                    left &&
                    right &&
                    left.value === right.value &&
                    left.token === right.token &&
                    left.status === right.status;

                if (paddingDirs.length === 4 && vertEq && horzEq) {
                    // Symmetric: emit paddingVertical + paddingHorizontal
                    spaceRaw.push({
                        nodeId: node.id,
                        name: node.name,
                        property: 'paddingVertical',
                        value: `${top!.value}px`,
                        token: top!.token,
                        tokenStatus: top!.status,
                    });
                    spaceRaw.push({
                        nodeId: node.id,
                        name: node.name,
                        property: 'paddingHorizontal',
                        value: `${left!.value}px`,
                        token: left!.token,
                        tokenStatus: left!.status,
                    });
                } else {
                    // 4 separate entries
                    for (const d of paddingDirs) {
                        spaceRaw.push({
                            nodeId: node.id,
                            name: node.name,
                            property: d.field as
                                | 'paddingTop'
                                | 'paddingRight'
                                | 'paddingBottom'
                                | 'paddingLeft',
                            value: `${d.value}px`,
                            token: d.token,
                            tokenStatus: d.status,
                        });
                    }
                }
            }
        }

        // Gap (itemSpacing)
        const gapValue: unknown = (node as any).itemSpacing;
        if (typeof gapValue === 'number') {
            const { token, status } = await readBoundToken(bvRecord, 'itemSpacing');
            spaceRaw.push({
                nodeId: node.id,
                name: node.name,
                property: 'gap',
                value: `${gapValue}px`,
                token,
                tokenStatus: status,
            });
        }

        // — Dimension (width + height) —
        // NOTE: Figma plugin typings do not expose a standard boundVariables.width/.height
        // binding. Width/height are typically layout-constrained, not variable-bound.
        // readBoundToken will return { token: null, status: 'raw' } for these fields.
        // This assumption should be validated in T13 smoke test.
        const dimFields: Array<['width' | 'height', string]> = [
            ['width', 'width'],
            ['height', 'height'],
        ];
        for (const [property, field] of dimFields) {
            // Skip root frame dimensions (Finding 2)
            if (node.id === root!.id) continue;
            const rawValue: unknown = (node as any)[field];
            if (typeof rawValue === 'number') {
                // Only extract FIXED dimensions; FILL and HUG are layout-driven (Finding 1)
                if (property === 'width' && (node as any).layoutSizingHorizontal !== 'FIXED')
                    continue;
                if (property === 'height' && (node as any).layoutSizingVertical !== 'FIXED')
                    continue;
                const { token, status } = await readBoundToken(bvRecord, field);
                dimensionRaw.push({
                    nodeId: node.id,
                    name: node.name,
                    property,
                    value: `${rawValue}px`,
                    token,
                    tokenStatus: status,
                });
            }
        }

        // — Border Radius —
        // Skip figma.mixed (per-corner radii) — only uniform cornerRadius is extracted.
        const cr: unknown = (node as any).cornerRadius;
        if (typeof cr === 'number') {
            // Figma uniform cornerRadius may not have boundVariables.cornerRadius.
            // Try per-corner fields as fallback before giving up.
            const cornerFields = [
                'cornerRadius',
                'topLeftRadius',
                'topRightRadius',
                'bottomLeftRadius',
                'bottomRightRadius',
            ] as const;
            let radiusToken: string | null = null;
            let radiusStatus: TokenStatus = 'raw';
            for (const cf of cornerFields) {
                const result = await readBoundToken(bvRecord, cf);
                if (result.status !== 'raw') {
                    radiusToken = result.token;
                    radiusStatus = result.status;
                    break;
                }
            }
            radiusRaw.push({
                nodeId: node.id,
                name: node.name,
                value: `${cr}px`,
                token: radiusToken,
                tokenStatus: radiusStatus,
            });
        }

        // — Shadow —
        // Figma shadows bind at effect-style level (effectStyleId), not per-effect boundVariables.
        // Token resolution is via style name → schema key (e.g. "shadow/md" → "shadow.md").
        // Per-effect bindings (color/offset/etc.) are intentionally NOT followed here.
        // NOTE: This naming assumption must be validated in T13 smoke test.
        const effects: any[] = Array.isArray((node as any).effects) ? (node as any).effects : [];
        const shadowEffects = effects.filter(
            (eff: any) => eff.type === 'DROP_SHADOW' || eff.type === 'INNER_SHADOW',
        );
        if (shadowEffects.length > 0) {
            // Resolve style token once per node (all effects share the same effectStyleId)
            const { token, status } = await readEffectStyleToken(node);
            for (const eff of shadowEffects) {
                shadowRaw.push({
                    nodeId: node.id,
                    name: node.name,
                    value: shadowToCss(eff),
                    token,
                    tokenStatus: status,
                });
            }
        }

        if ('children' in node) for (const ch of node.children) await visit(ch);
    }

    await visit(root as SceneNode);

    const colors = groupBy(colorRaw, (e) =>
        JSON.stringify([
            e.name,
            e.property,
            e.token,
            e.hex,
            e.tokenStatus,
            e.background ? e.background.kind : null,
            e.background ? e.background.hex : null,
        ]),
    );
    const typography = groupBy(typoRaw, (e) =>
        JSON.stringify([
            e.name,
            e.characters,
            e.textStyle,
            e.viewport,
            e.appliedStatus,
            e.overriddenFields,
            e.resolved,
        ]),
    );

    const extract: RawExtract = {
        schemaMode,
        viewport,
        colors: colors as unknown as ColorUsage[],
        typography: typography as unknown as TypographyUsage[],
        spaces: spaceRaw,
        dimensions: dimensionRaw,
        radii: radiusRaw,
        shadows: shadowRaw,
        stats: {
            nodeCount: visited,
            textNodes,
            visited,
        },
    };

    const [screenshotB64, nodeTree] = await Promise.all([
        captureScreenshot(root as FrameNode).catch(() => ''),
        walkTree(root as SceneNode).catch(() => [] as NodeInfo[]),
    ]);

    return { extract, llmContext: { screenshotB64, nodeTree } };
}
