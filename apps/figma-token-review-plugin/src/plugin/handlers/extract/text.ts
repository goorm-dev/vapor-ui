/* eslint-disable @typescript-eslint/no-explicit-any -- Figma seg/style shapes are intentionally loose. */

export type TextClassification = {
    appliedStatus: 'styled-clean' | 'styled-override' | 'var-only' | 'raw' | 'mixed';
    textStyle: string | null;
    overriddenFields: string[];
    seg: any;
};

export type TextShot = {
    imageBase64: string;
    fontSize: number;
    isBold: boolean;
};

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

/**
 * TEXT 노드 렌더링 결과를 PNG(2x) 로 캡처.
 * text-contrast 판정용 픽셀 샘플링에 사용. 실패 시 undefined.
 */
export async function captureTextShot(node: TextNode): Promise<TextShot | undefined> {
    try {
        const bytes = await node.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 2 },
        });
        const fontSize = typeof node.fontSize === 'number' ? node.fontSize : 16;
        const fn: any = node.fontName;
        const isBold =
            fn && typeof fn.style === 'string' ? /bold|black|heavy/i.test(fn.style) : false;

        return { imageBase64: figma.base64Encode(bytes), fontSize, isBold };
    } catch (_e) {
        return;
    }
}
