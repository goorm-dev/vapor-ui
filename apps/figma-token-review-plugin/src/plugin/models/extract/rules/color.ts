/* eslint-disable @typescript-eslint/no-explicit-any -- Figma paint bindings are intentionally untyped. */
import type { ColorBackground, ColorProperty } from '~/common/schemas';

import type { EmissionOf, ExtractionRule } from '../engine/types';
import { isVectorLike } from '../filters';
import { classifyBackground, rgbaToHex } from '../paint';
import type { TextShot } from '../text';
import { captureTextShot } from '../text';
import { toToken, walk } from '../variables';

/**
 * Ported from visitor.ts extractPaints (lines 142-192).
 * Iterates bound alias entries (walk + toToken) then raw SOLID paints.
 * Invisible-paint skip and bound[i] exclusion preserved exactly.
 * Emits without nodeId/name — engine stamps those.
 */
async function readPaints(
    node: SceneNode,
    paints: any,
    bound: any[],
    property: ColorProperty,
    textShot: TextShot | undefined,
    textBackground: ColorBackground | null,
): Promise<EmissionOf['colors'][]> {
    const paintList = Array.isArray(paints) ? paints : null;
    const shotFor = property === 'text' && node.type === 'TEXT' ? textShot : undefined;
    const bgFor = property === 'text' ? textBackground : null;
    const out: EmissionOf['colors'][] = [];

    // 1) 변수 바인딩된 paint: alias 체인 추적으로 토큰 해석
    for (let i = 0; i < bound.length; i++) {
        const a = bound[i];
        if (!a || !a.id) continue;

        const p = paintList ? paintList[i] : null;
        if (p && p.visible === false) continue;

        const { chain, finalHex } = await walk(node, a.id);
        const { token, appliedToken, tokenStatus } = toToken(chain);

        out.push({
            property,
            token,
            appliedToken,
            hex: finalHex,
            background: bgFor,
            tokenStatus,
            textShot: shotFor,
        });
    }

    // 2) 바인딩 없는 SOLID paint: raw
    if (!paintList) return out;

    paintList.forEach((p: any, i: number) => {
        if (!p || p.type !== 'SOLID' || p.visible === false || bound[i]) return;
        out.push({
            property,
            token: null,
            hex: rgbaToHex(p.color),
            background: bgFor,
            tokenStatus: 'raw',
            textShot: shotFor,
        });
    });

    return out;
}

/**
 * fills 채널 추출 규칙.
 * TEXT/벡터 노드 fill → property = 'text' + textShot/textBackground 첨부.
 * 일반 fill → property = 'fill'.
 * Ported from collectColors doFills branch (visitor.ts:116-126).
 */
export function fillColorsRule(): ExtractionRule<'colors'> {
    return {
        name: 'color:fill',
        category: 'colors',
        filterKeys: ['fills'],
        extract: async (node, _ctx) => {
            const bv: any = (node as any).boundVariables || {};
            const fillProperty: ColorProperty =
                node.type === 'TEXT' || isVectorLike(node) ? 'text' : 'fill';
            const textBackground = node.type === 'TEXT' ? classifyBackground(node) : null;
            const textShot =
                node.type === 'TEXT'
                    ? await captureTextShot(node as TextNode, textBackground)
                    : undefined;
            return readPaints(
                node,
                (node as any).fills,
                bv.fills || [],
                fillProperty,
                textShot,
                textBackground,
            );
        },
    };
}

/**
 * strokes 채널 추출 규칙.
 * property = 'stroke', textShot/textBackground 없음.
 * Ported from collectColors doStrokes branch (visitor.ts:127-136).
 */
export function strokeColorsRule(): ExtractionRule<'colors'> {
    return {
        name: 'color:stroke',
        category: 'colors',
        filterKeys: ['strokes'],
        extract: async (node, _ctx) => {
            const bv: any = (node as any).boundVariables || {};
            return readPaints(
                node,
                (node as any).strokes,
                bv.strokes || [],
                'stroke',
                undefined,
                null,
            );
        },
    };
}
