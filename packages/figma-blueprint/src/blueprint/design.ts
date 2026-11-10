// What a design draws besides its library tree, for the style and visual checks.
// frames: layers outside every library instance, local components included, with the variables they bind and whether
// they leave auto layout. Nothing inside a library instance is a frame, slot contents neither: a slot mostly holds
// library instances, and its bare text (a Button label) carries the component's own styles, so gate 2 would flag code
// that only writes <Button>. Only bound properties count, since a raw value in the design leaves the code free to use
// one; a frame that binds nothing and stays in flow has nothing to grade and is left out.
// texts: every visible TEXT line, library internals included, for Block-Match and Position.
import type { Alias, FigmaNode, Rect } from './figma-mock';

// Relative to the graded frame's top-left.
export type Box = { x: number; y: number; w: number; h: number };

// tokens: Figma property as boundVariables keys it → variable name.
export interface Frame {
    id: string;
    name: string;
    box?: Box;
    absolute?: true;
    tokens: Record<string, string>;
}

// The second and later lines of one TEXT node are "<id>#1", "<id>#2"...
export interface TextLine {
    id: string;
    text: string;
    box: Box;
}

// meta.variables of GET /v1/files/:key/variables/local, which also lists the library variables the file uses.
export type FigmaVariables = Record<string, { key: string; name: string }>;

// None when Figma gave the node or the frame no bounds (a hand-written tree).
export const boxesIn = (root: FigmaNode) => {
    const o = root.absoluteBoundingBox;
    return (b: Rect | null | undefined): Box | undefined =>
        o && b ? { x: b.x - o.x, y: b.y - o.y, w: b.width, h: b.height } : undefined;
};

// A file holds a library variable under its own id ("VariableID:<key>/<node>"), and the response can list it under
// another node, so an id it lacks still resolves by key. Without the response, or for a variable it does not list at
// all (mostly typography variables on text), a token stays the variable id.
function namer(variables: FigmaVariables | undefined) {
    if (!variables) return (id: string) => id;
    const byKey = new Map(Object.values(variables).map((v) => [v.key, v.name]));
    return (id: string) =>
        variables[id]?.name ?? byKey.get(id.replace(/^VariableID:/, '').split('/')[0]) ?? id;
}

const isAlias = (v: unknown): v is Alias => typeof (v as Alias).id === 'string';

// One token per property; a property whose paints, text ranges or corners bind different variables gets one per
// index or corner ("fills.1", "rectangleCornerRadii.RECTANGLE_TOP_LEFT_CORNER_RADIUS").
function tokensOf(n: FigmaNode, name: (id: string) => string) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(n.boundVariables ?? {})) {
        const leaves = isAlias(v)
            ? [[k, name(v.id)]]
            : Object.entries(v).map(([at, a]) => [`${k}.${at}`, name(a.id)]);
        if (new Set(leaves.map(([, t]) => t)).size === 1) out[k] = leaves[0][1];
        else for (const [at, t] of leaves) out[at] = t;
    }
    return out;
}

export function layers(
    root: FigmaNode,
    isLib: (n: FigmaNode) => boolean,
    variables: FigmaVariables | undefined,
) {
    const at = boxesIn(root);
    const name = namer(variables);
    const frames: Frame[] = [];
    const texts: TextLine[] = [];
    const walk = (n: FigmaNode, inLib: boolean) => {
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
        const drawnHere = !inLib && !isLib(n);
        if (drawnHere) {
            const tokens = tokensOf(n, name);
            const absolute = n.layoutPositioning === 'ABSOLUTE';
            const box = at(n.absoluteBoundingBox);
            if (absolute || Object.keys(tokens).length)
                frames.push({
                    id: n.id,
                    name: n.name,
                    ...(box && { box }),
                    ...(absolute && { absolute: true as const }),
                    tokens,
                });
        }
        for (const c of n.children ?? []) walk(c, !drawnHere);
    };
    walk(root, false);
    return { frames, texts };
}
