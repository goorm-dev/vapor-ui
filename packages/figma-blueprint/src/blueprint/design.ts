import type { FigmaNode, Rect } from '~/figma';

export type Box = { x: number; y: number; w: number; h: number };

export interface TextLine {
    id: string;
    text: string;
    box: Box;
}

export const boxesIn = (root: FigmaNode) => {
    const o = root.absoluteBoundingBox;
    return (b: Rect | null | undefined): Box | undefined =>
        o && b ? { x: b.x - o.x, y: b.y - o.y, w: b.width, h: b.height } : undefined;
};

const isEmptyParagraph = (line: string) => !line.replace(/\u200b/g, '').trim();

export function textsIn(root: FigmaNode) {
    const at = boxesIn(root);
    const texts: TextLine[] = [];
    const walk = (n: FigmaNode) => {
        if (n.visible === false) return;
        if (n.type === 'TEXT' && n.characters) {
            const b = at(n.absoluteRenderBounds ?? n.absoluteBoundingBox);
            const lines = n.characters.split(/[\n\u2028\u2029]/);
            const kept = lines.flatMap((text, i) => (isEmptyParagraph(text) ? [] : [{ text, i }]));
            const boundsHugGlyphs = !!n.absoluteRenderBounds;
            const [first, last] = boundsHugGlyphs
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
