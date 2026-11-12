// texts: every visible TEXT line, library internals included, for visual scoring's Block-Match and Position.
import type { FigmaNode, Rect } from './figma-mock';

// Relative to the graded frame's top-left.
export type Box = { x: number; y: number; w: number; h: number };

// Blank lines are left out; the second and later lines left of one TEXT node are "<id>#1", "<id>#2"...
export interface TextLine {
    id: string;
    text: string;
    box: Box;
}

// None when Figma gave the node or the frame no bounds (a hand-written tree).
export const boxesIn = (root: FigmaNode) => {
    const o = root.absoluteBoundingBox;
    return (b: Rect | null | undefined): Box | undefined =>
        o && b ? { x: b.x - o.x, y: b.y - o.y, w: b.width, h: b.height } : undefined;
};

export function textsIn(root: FigmaNode) {
    const at = boxesIn(root);
    const texts: TextLine[] = [];
    const walk = (n: FigmaNode) => {
        if (n.visible === false) return;
        if (n.type === 'TEXT' && n.characters) {
            const b = at(n.absoluteRenderBounds ?? n.absoluteBoundingBox);
            const lines = n.characters.split(/[\n\u2028\u2029]/);
            // Figma keeps an empty paragraph as a lone zero-width space, which trim() does not remove.
            const kept = lines.flatMap((text, i) =>
                text.replace(/\u200b/g, '').trim() ? [{ text, i }] : [],
            );
            // A blank line keeps its share of the height, except above the first line and below the last on render
            // bounds, which hug the glyphs.
            const [first, last] = n.absoluteRenderBounds
                ? [kept[0]?.i ?? 0, kept.at(-1)?.i ?? 0]
                : [0, lines.length - 1];
            if (b) {
                const h = b.h / (last - first + 1);
                texts.push(
                    ...kept.map(({ text, i }, k) => ({
                        id: k ? `${n.id}#${k}` : n.id,
                        text,
                        box: { ...b, y: b.y + h * (i - first), h },
                    })),
                );
            }
        }
        for (const c of n.children ?? []) walk(c);
    };
    walk(root);
    return texts;
}
