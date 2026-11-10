// texts: every visible TEXT line, library internals included, for visual scoring's Block-Match and Position.
import type { FigmaNode, Rect } from './figma-mock';

// Relative to the graded frame's top-left.
export type Box = { x: number; y: number; w: number; h: number };

// The second and later lines of one TEXT node are "<id>#1", "<id>#2"...
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
            // Figma keeps an empty paragraph as a lone zero-width space, which trim() does not remove.
            const ls = n.characters
                .split(/[\n\u2028\u2029]/)
                .filter((l) => l.replace(/\u200b/g, '').trim());
            if (b)
                texts.push(
                    ...ls.map((text, i) => ({
                        id: i ? `${n.id}#${i}` : n.id,
                        text,
                        box: { ...b, y: b.y + (b.h / ls.length) * i, h: b.h / ls.length },
                    })),
                );
        }
        for (const c of n.children ?? []) walk(c);
    };
    walk(root);
    return texts;
}
