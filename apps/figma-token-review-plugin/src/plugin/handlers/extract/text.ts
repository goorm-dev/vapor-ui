/* eslint-disable @typescript-eslint/no-explicit-any -- Figma seg/style shapes are intentionally loose. */
import type { ColorBackground } from '~/common/schemas';

export type TextClassification = {
    appliedStatus: 'styled-clean' | 'styled-override' | 'var-only' | 'raw' | 'mixed';
    textStyle: string | null;
    overriddenFields: string[];
    seg: any;
};

export type TextShot = {
    fontSize: number;
    isBold: boolean;
    imageBase64?: string;
    cropX?: number;
    cropY?: number;
    cropW?: number;
    cropH?: number;
};

const CAPTURE_SCALE = 2;

function sameLineHeight(a: LineHeight | undefined, b: LineHeight | undefined): boolean {
    if (!a || !b) return a === b;
    if (a.unit !== b.unit) return false;
    if (a.unit === 'AUTO' || b.unit === 'AUTO') return a.unit === b.unit;

    return a.value === b.value;
}

/**
 * TEXT 노드 하나에 대해 스타일 적용 상태를 판정.
 * - segs > 1  → mixed
 * - textStyleId 있음 → 세부 오버라이드 필드 검사 → styled-clean / styled-override
 * - textStyleId 없음, boundVariables 존재 → var-only
 * - 그 외 → raw
 */
export async function classifyTextNode(node: TextNode): Promise<TextClassification> {
    const segs = node.getStyledTextSegments([
        'textStyleId',
        'fontName',
        'fontSize',
        'lineHeight',
        'letterSpacing',
        'boundVariables',
    ]);

    if (segs.length > 1) {
        return { appliedStatus: 'mixed', textStyle: null, overriddenFields: [], seg: segs[0] };
    }

    const seg = segs[0];
    const styleId = seg && seg.textStyleId;

    if (styleId) {
        const style: any = await figma.getStyleByIdAsync(styleId).catch(() => null);
        if (!style) {
            return { appliedStatus: 'styled-clean', textStyle: null, overriddenFields: [], seg };
        }

        const overriddenFields: string[] = [];

        if (
            seg.fontName?.family !== style.fontName?.family ||
            seg.fontName?.style !== style.fontName?.style
        ) {
            overriddenFields.push('fontName');
        }

        if (seg.fontSize !== style.fontSize) overriddenFields.push('fontSize');
        if (!sameLineHeight(seg.lineHeight, style.lineHeight)) overriddenFields.push('lineHeight');
        if (
            seg.letterSpacing?.unit !== style.letterSpacing?.unit ||
            seg.letterSpacing?.value !== style.letterSpacing?.value
        ) {
            overriddenFields.push('letterSpacing');
        }

        return {
            appliedStatus: overriddenFields.length ? 'styled-override' : 'styled-clean',
            textStyle: style.name,
            overriddenFields,
            seg,
        };
    }

    const bv = (seg && seg.boundVariables) || {};
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

function readTextMeta(node: TextNode): { fontSize: number; isBold: boolean } {
    const fontSize = typeof node.fontSize === 'number' ? node.fontSize : 16;
    const fn: any = node.fontName;
    const isBold = fn && typeof fn.style === 'string' ? /bold|black|heavy/i.test(fn.style) : false;
    return { fontSize, isBold };
}

/**
 * 배경이 결정적(SOLID opaque) 이면 hex 로 직접 대비 계산할 수 있으므로 PNG 불필요.
 * 배경이 ambiguous 이면 fill 있는 최근접 조상을 그대로 PNG 로 캡처 (텍스트 포함).
 * 분석기는 이 PNG 를 텍스트 bbox 로 크롭한 뒤 fg 색과 거리가 먼 픽셀 = 실제 배경 픽셀로 간주해 평균.
 * 노드 visibility 를 건드리지 않으므로 undo 히스토리/인스턴스 override 오염 없음.
 * 실패 시 fontSize/isBold 만 담긴 TextShot 을 반환 (분석기는 이 경우 스킵).
 */
export async function captureTextShot(
    node: TextNode,
    background: ColorBackground | null,
): Promise<TextShot | undefined> {
    const meta = readTextMeta(node);

    if (background && (background.kind === 'white' || background.kind === 'other')) {
        return meta;
    }

    const ancestor = findBackgroundAncestor(node);
    if (!ancestor) return meta;

    const tb = node.absoluteBoundingBox;
    const pb = ancestor.absoluteRenderBounds ?? ancestor.absoluteBoundingBox;
    if (!tb || !pb) return meta;

    let bytes: Uint8Array;
    try {
        bytes = await ancestor.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: CAPTURE_SCALE },
        });
    } catch (_e) {
        return meta;
    }

    const cropX = Math.max(0, Math.round((tb.x - pb.x) * CAPTURE_SCALE));
    const cropY = Math.max(0, Math.round((tb.y - pb.y) * CAPTURE_SCALE));
    const cropW = Math.max(1, Math.round(tb.width * CAPTURE_SCALE));
    const cropH = Math.max(1, Math.round(tb.height * CAPTURE_SCALE));

    return {
        ...meta,
        imageBase64: figma.base64Encode(bytes),
        cropX,
        cropY,
        cropW,
        cropH,
    };
}

type ExportableAncestor = SceneNode & {
    exportAsync: (settings: any) => Promise<Uint8Array>;
    absoluteBoundingBox: Rect | null;
    absoluteRenderBounds: Rect | null;
};

function findBackgroundAncestor(node: SceneNode): ExportableAncestor | null {
    let cur: any = node.parent;
    while (cur && cur.type !== 'PAGE' && cur.type !== 'DOCUMENT') {
        const hasFills = 'fills' in cur && Array.isArray(cur.fills);
        const visible = hasFills ? cur.fills.find((p: any) => p && p.visible !== false) : null;
        const canExport = typeof cur.exportAsync === 'function' && !!cur.absoluteBoundingBox;
        if (visible && canExport) return cur as ExportableAncestor;
        cur = cur.parent;
    }
    return null;
}
