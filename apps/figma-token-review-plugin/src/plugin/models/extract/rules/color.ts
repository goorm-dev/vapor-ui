/* eslint-disable @typescript-eslint/no-explicit-any -- Figma paint bindings are intentionally untyped. */
import type { ColorBackground, ColorProperty } from '~/common/schemas';

import type { EmissionOf, ExtractionRule } from '../engine/types';
import { isVectorLike } from '../filters';
import { classifyBackground, rgbaToHex } from '../paint';
import type { TextShot } from '../text';
import { captureTextShot } from '../text';
import { toToken, walk } from '../variables';

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
