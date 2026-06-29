/* eslint-disable @typescript-eslint/no-explicit-any -- 1:1 mechanical port of .claude/skills/figma-token-review/scripts/extract.figma.js. Variable-alias chains, Figma paint shapes and `valuesByMode` lookups are intentionally untyped here to mirror the source. */
import type {
    ColorBackground,
    ColorProperty,
    ColorUsage,
    RawExtract,
    SchemaMode,
    TokenStatus,
    TypographyUsage,
    Viewport,
} from '~/shared/schema';

const MODE: 'both' | 'color' | 'typography' = 'both';

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
    return name && name.startsWith('color-')
        ? 'colors.' + name.slice('color-'.length).replace(/-/g, '.')
        : null;
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

function classifyBackground(node: SceneNode): ColorBackground {
    let cur: any = node.parent;
    while (cur && cur.type !== 'PAGE') {
        const nodeOpaque = ('opacity' in cur ? cur.opacity : 1) === 1;
        const fills = 'fills' in cur && Array.isArray(cur.fills) ? cur.fills : [];
        const solid = fills.find((p: any) => p && p.type === 'SOLID' && p.visible !== false);
        if (solid) {
            const fillOpaque = (solid.opacity ?? 1) === 1;
            if (!nodeOpaque || !fillOpaque)
                return { kind: 'ambiguous', hex: rgbaToHex(solid.color) };
            const hex = rgbaToHex(solid.color);
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
): (Omit<T, 'nodeId'> & { nodeIds: string[]; count: number })[] {
    const map = new Map<string, any>();
    for (const it of items) {
        const key = keyOf(it);
        const g = map.get(key);
        if (g) {
            g.nodeIds.push(it.nodeId);
            g.count++;
        } else {
            const { nodeId, ...rest } = it;
            map.set(key, { ...rest, nodeIds: [nodeId], count: 1 });
        }
    }
    return [...map.values()];
}

export async function callEvaluator(frameId: string): Promise<RawExtract> {
    figma.skipInvisibleInstanceChildren = true;

    const root = await figma.getNodeByIdAsync(frameId);
    if (!root) throw new Error('노드를 찾을 수 없음: ' + frameId);

    let pageNode: any = root;
    while (pageNode && pageNode.type !== 'PAGE') pageNode = pageNode.parent;
    if (pageNode && figma.currentPage !== pageNode) await figma.setCurrentPageAsync(pageNode);

    const colorRaw: (ColorUsage & { nodeId: string })[] = [];
    const typoRaw: (TypographyUsage & { nodeId: string })[] = [];
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
        visited++;
        const bv: any = (node as any).boundVariables || {};
        const fillProperty: ColorProperty = node.type === 'TEXT' ? 'text' : 'fill';

        if (MODE !== 'typography') {
            const extractPaints = async (
                paints: any,
                bound: any[],
                property: ColorProperty,
            ): Promise<void> => {
                for (const a of bound) {
                    if (!a || !a.id) continue;
                    const { chain, finalHex } = await walk(node, a.id);
                    const { token, tokenStatus } = toToken(chain);
                    pushColor(node, property, token, finalHex, tokenStatus);
                }
                if (Array.isArray(paints)) {
                    paints.forEach((p: any, i: number) => {
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

    return {
        schemaMode,
        viewport,
        colors: colors as unknown as ColorUsage[],
        typography: typography as unknown as TypographyUsage[],
        stats: {
            nodeCount: visited,
            textNodes,
            visited,
        },
    };
}
