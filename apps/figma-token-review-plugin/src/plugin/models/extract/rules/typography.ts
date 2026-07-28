/* eslint-disable @typescript-eslint/no-explicit-any -- Figma seg shape is intentionally loose. */
import { isText } from '../engine/guards';
import type { ExtractionRule } from '../engine/types';
import { classifyTextNode } from '../text';

export const TYPOGRAPHY_KEYS = [
    'characters',
    'fontName',
    'fontSize',
    'lineHeight',
    'letterSpacing',
    'textStyleId',
] as const;

export function typographyRule(): ExtractionRule<'typography'> {
    return {
        name: 'typography',
        category: 'typography',
        filterKeys: TYPOGRAPHY_KEYS,
        guards: [isText],
        extract: async (node, ctx) => {
            const textNode = node as TextNode;
            const { appliedStatus, textStyle, overriddenFields, seg } =
                await classifyTextNode(textNode);

            return [
                {
                    characters: (textNode.characters || '').slice(0, 20),
                    textStyle,
                    viewport: ctx.viewport,
                    appliedStatus,
                    overriddenFields,
                    resolved: {
                        fontSize: seg ? seg.fontSize : null,
                        lineHeight: seg ? seg.lineHeight : null,
                        letterSpacing: seg ? (seg as any).letterSpacing : null,
                        fontName: seg ? seg.fontName : null,
                    },
                },
            ];
        },
    };
}
