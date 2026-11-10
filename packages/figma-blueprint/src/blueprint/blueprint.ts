// Blueprint of a Figma frame: the tree of elements the code must contain, library instances only.
// Each visible Code Connect instance runs its own template against the REST node (figma-mock.ts) and contributes
// the elements its snippet draws itself. A connected instance inside another one counts only when the outer template
// renders it (executeTemplate marker) or it sits in a SLOT; otherwise the part draws it itself (Select.Trigger's chevron).
// Prop rules: literal props only, no "false", no placeholder, no "..." example, aria-label → "*". A node sits under
// the library element it is in; layout frames do not count. What the design draws besides library instances is
// design.ts.
import ts from 'typescript';

import type { Catalog, Entry } from '~/catalog/catalog';
import type { Pkg } from '~/entries/entries-file';

import type { Box, FigmaVariables, Frame, TextLine } from './design';
import { boxesIn, layers } from './design';
import type { FigmaNode } from './figma-mock';
import { makeHandles, render, withContext } from './figma-mock';

export type { Box, FigmaVariables, Frame, TextLine };

export interface FigmaTree {
    document: FigmaNode;
    // remote: false for a component defined in the design file itself, not a library.
    components?: Record<
        string,
        { key: string; name: string; componentSetId?: string; remote?: boolean }
    >;
    componentSets?: Record<string, { key: string; name: string }>;
}

// id: the Figma instance whose template wrote the node; the second and later elements one template writes are
// "<id>#1", "<id>#2"... in snippet order.
// pkg: the package whose template wrote the node, so a composites Dialog.Root is not met by core's.
// anyParent: Figma's nesting is not the code's here (inside a self-closing part), so the node sits under its owner's
// root for reading and its position must not be judged.
// box: the instance's, shared by every element its template writes.
export interface BlueprintNode {
    id: string;
    tag: string;
    props: string[];
    pkg: Pkg;
    anyParent?: true;
    children: BlueprintNode[];
    box?: Box;
}

// A library instance the design draws that is not a node, and why. One inside an excluded instance shares its reason;
// one inside an unscorable instance is inside-unscorable.
// box: the code still draws it, so visual scoring still measures it.
export interface Excluded {
    node: string;
    name: string;
    reason:
        'part-draws-icon' | 'part-draws-itself' | 'inside-self-closing-part' | 'inside-unscorable';
    box?: Box;
}

// A library instance that could not be read, so the design cannot be graded.
export interface Unscorable {
    node: string;
    name: string;
    cause: 'no-template' | 'template-error';
    message?: string;
    box?: Box;
}

// size: the graded frame's, which boxes are relative to. styles: whether token names are Figma variable names, or the
// variable ids the tree carries because no variables response was at hand.
export interface Blueprint {
    version: 3;
    size?: { w: number; h: number };
    nodes: BlueprintNode[];
    excluded: Excluded[];
    unscorable: Unscorable[];
    frames: Frame[];
    texts: TextLine[];
    styles: 'ok' | 'no-variables-api';
}

interface Element {
    tag: string;
    attrs: string[];
    children: Element[];
    nested: string[];
    selfClosing: boolean;
}

// A kept snippet element and the node it became.
interface Kept {
    el: Element;
    node: BlueprintNode;
}

// Where a node goes: under `node`, `any` when its position must not be judged; null is the top level.
type Place = { node: BlueprintNode; any: boolean } | null;

interface Owner {
    name: string;
    pkg: Pkg;
    nested: Map<string, BlueprintNode>;
    byPart: Map<string, Kept>;
    root: Kept | undefined;
}

// Template id without a real instance: every getter answers with its first option, every search finds nothing.
const dummy: object = {
    type: 'INSTANCE',
    children: [],
    properties: {},
    getEnum: (_: string, o: Record<string, unknown>) => Object.values(o)[0],
    getBoolean: (_: string, o?: Record<string, unknown>) => (o ? Object.values(o)[0] : false),
    getString: () => '',
    getInstanceSwap: () => undefined,
    findInstance: () => dummy,
    findText: () => ({ type: 'TEXT', textContent: '' }),
    findConnectedInstance: () => null,
    findConnectedInstances: () => [],
    findLayers: () => [],
    codeConnectId: () => null,
    hasCodeConnect: () => false,
    executeTemplate: () => ({ example: [] }),
};
const ids = new WeakMap<Entry, string | null>();
const idOf = (catalog: Catalog, entry: Entry) => {
    if (!ids.has(entry)) {
        let id: string | null = null;
        try {
            id =
                withContext(
                    { handle: dummy, batch: entry.batch, texts: new Set() },
                    catalog.runTemplate(entry),
                ).id ?? null;
        } catch {
            // a template that cannot run without a real instance has no id
        }
        ids.set(entry, id);
    }
    return ids.get(entry) ?? null;
};

// ---------- snippet → elements
type Jsx = ts.JsxElement | ts.JsxSelfClosingElement;
const open = (n: Jsx) => (ts.isJsxElement(n) ? n.openingElement : n);
function attrsOf(el: Jsx, texts: Set<unknown>) {
    const out: string[] = [];
    for (const a of open(el).attributes.properties) {
        if (!ts.isJsxAttribute(a)) continue;
        const k = a.name.getText();
        const init = a.initializer;
        const e = init && ts.isJsxExpression(init) ? init.expression : init;
        if (k === 'placeholder') continue;
        if (!init) out.push(k);
        else if (e && (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e))) {
            if (e.text === 'false') continue;
            // Copy never matches the generated wording, so a prop holding Figma text only has to be present.
            const v = k === 'aria-label' || texts.has(e.text) ? '*' : e.text;
            // Any other "..." is a template's example value where the design has none (<Radio.Root value="..." />).
            if (v === '...') continue;
            out.push(`${k}=${v.includes('"') ? `{${JSON.stringify(v)}}` : `"${v}"`}`);
        } else if (e?.kind === ts.SyntaxKind.TrueKeyword) out.push(k);
        // A number cannot come from a Figma property, so it is a template's example value (totalPages={10}).
        else if (e && ts.isNumericLiteral(e)) continue;
    }
    return out;
}
// One snippet as an element tree; a marker becomes the id of the nested instance in the element it sits in.
function parse(code: string, texts: Set<unknown>) {
    const sf = ts.createSourceFile(
        'x.tsx',
        `<>${code}</>`,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
    );
    const root: Pick<Element, 'children' | 'nested'> = { children: [], nested: [] };
    (function visit(n: ts.Node, at: Pick<Element, 'children' | 'nested'>) {
        if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
            const tag = open(n).tagName.getText();
            if (tag === '__nested') {
                at.nested.push(attrsOf(n, texts)[0].slice(4, -1));
                return;
            }
            // <Button>...</Button> is a usage hint the template adds (Dialog's trigger), not something the design draws,
            // unless the "..." is the design's own text.
            if (
                ts.isJsxElement(n) &&
                !texts.has('...') &&
                n.children
                    .map((c) => c.getText())
                    .join('')
                    .trim() === '...'
            )
                return;
            const el: Element = {
                tag,
                attrs: attrsOf(n, texts),
                children: [],
                nested: [],
                selfClosing: ts.isJsxSelfClosingElement(n),
            };
            at.children.push(el);
            at = el;
        }
        ts.forEachChild(n, (c) => visit(c, at));
    })(sf, root);
    return root;
}

// "💙toggleGroup" = "ToggleGroup", "💙Breadcrumb" = "Breadcrumb.Root".
const partName = (name: string) =>
    name
        .replace(/^\W+/u, '')
        .replace(/\s+/g, '')
        .replace(/\.Root$/, '')
        .toLowerCase();
const byPartName = (table: Record<string, string[]>) =>
    new Map(Object.entries(table).map(([k, v]) => [partName(k), new Set(v.map(partName))]));

// ---------- the walk
export function blueprint(
    tree: FigmaTree,
    catalog: Catalog,
    variables?: FigmaVariables,
): Blueprint {
    const { entries } = catalog;
    // A design can hold an older copy of a library component under a key that is no longer published, and Figma still
    // connects it. ponytail: match those by name, only where the name is unique in the entries and the component comes
    // from a library (a design file's own "Dialog" is not one).
    const byName = new Map<string, Entry | null>();
    for (const e of Object.values(entries)) byName.set(e.name, byName.has(e.name) ? null : e);
    const ownIcons = byPartName(catalog.tables.internalIcons);
    const ownParts = byPartName(catalog.tables.internalParts);

    const { document, components = {}, componentSets = {} } = tree;
    const nameOf = (n: FigmaNode) => {
        const c = n.componentId === undefined ? undefined : components[n.componentId];
        return (
            (c?.componentSetId === undefined ? undefined : componentSets[c.componentSetId])?.name ??
            c?.name ??
            n.name
        );
    };
    const entryOf = (n: FigmaNode) => {
        const c = n.componentId === undefined ? undefined : components[n.componentId];
        const set = c?.componentSetId === undefined ? undefined : componentSets[c.componentSetId];
        return (
            c &&
            ((set && entries[set.key]) ??
                entries[c.key] ??
                (c.remote === false ? undefined : byName.get(nameOf(n))))
        );
    };
    const connected = (n: FigmaNode) => {
        const e = n.type === 'INSTANCE' && entryOf(n);
        return e ? { id: idOf(catalog, e), entry: e } : null;
    };
    const handle = makeHandles({ connected });
    // One node per instance, so three identical Buttons in the design need three in the code.
    const nodes: BlueprintNode[] = [];
    const excluded: Excluded[] = [];
    const unscorable: Unscorable[] = [];
    // A library instance is one the entries connect, or one named like a library component that nothing installed
    // connects: 💙 core, ❤️ icons, and 🩵 on a composites part's layer ("Dialog/🩵Action"). ponytail: an unprefixed
    // instance with no entry (a composites root when composites is not installed) only surfaces through its 🩵 layers.
    const marked = (s: string) => /(^|\/)(💙|❤️|🩵)/u.test(s);
    const isLib = (n: FigmaNode) =>
        n.type === 'INSTANCE' && (connected(n) !== null || marked(nameOf(n)) || marked(n.name));
    const boxOf = boxesIn(document);

    // Library parts the design draws in a node's subtree, the node included.
    const drawn = (n: FigmaNode, out = new Set<string>()) => {
        if (n.visible === false) return out;
        if (isLib(n)) out.add(partName(nameOf(n)));
        for (const c of n.children ?? []) drawn(c, out);
        return out;
    };
    // The library instances inside one that is not a node cannot be nodes either.
    const excludeIn = (n: FigmaNode, reason: Excluded['reason']) => {
        for (const c of n.children ?? []) {
            if (c.visible === false) continue;
            const box = boxOf(c.absoluteBoundingBox);
            if (isLib(c))
                excluded.push({ node: c.id, name: nameOf(c), reason, ...(box && { box }) });
            excludeIn(c, reason);
        }
    };
    // Of a snippet only the elements the design draws (or that hold one, or hold a nested instance) are expected.
    // Returns the element's node, or none; `out` gets every kept element in snippet order.
    const keep = (el: Element, parts: Set<string>, pkg: Pkg, out: Kept[]): BlueprintNode[] => {
        const below: Kept[] = [];
        const children = el.children.flatMap((c) => keep(c, parts, pkg, below));
        if (!children.length && !el.nested.length && !parts.has(partName(el.tag))) return [];
        const node: BlueprintNode = { id: '', tag: el.tag, props: el.attrs, pkg, children };
        out.push({ el, node }, ...below);
        return [node];
    };

    // owner: the nearest connected instance above, with the elements its snippet kept.
    // trail: names of the library instances passed since the owner, innermost last.
    // slotted: a SLOT node or a 🟨 slot layer was passed since the owner, the places a designer puts content.
    function visit(
        n: FigmaNode,
        at: Place,
        owner: Owner | null,
        trail: string[],
        slotted: boolean,
    ) {
        if (n.visible === false) return;
        if (n.type === 'SLOT' || (n.type === 'INSTANCE' && nameOf(n).startsWith('🟨')))
            slotted = true;
        const box = boxOf(n.absoluteBoundingBox);
        const boxed = box && { box };
        const c = connected(n);
        if (c) {
            const exclude = (reason: Excluded['reason']) => {
                excluded.push({ node: n.id, name: nameOf(n), reason, ...boxed });
                excludeIn(n, reason);
            };
            if (owner) {
                const nestedIn = owner.nested.get(n.id);
                if (nestedIn) at = { node: nestedIn, any: false };
                // An icon the nearest part draws itself in code (Select.Trigger's chevron) is not expected.
                else if (
                    ownIcons.get(partName(trail.at(-1) ?? owner.name))?.has(partName(nameOf(n)))
                )
                    return exclude('part-draws-icon');
                // A core component a composites part draws itself, outside any slot (Dialog.Root's close IconButton).
                // Only a composites owner: core 💙Dialog and composites Dialog share a part name.
                else if (
                    owner.pkg === 'composites' &&
                    !slotted &&
                    ownParts.get(partName(owner.name))?.has(partName(nameOf(n)))
                )
                    return exclude('part-draws-itself');
                // A part its template writes self-closing takes no children in code, so an instance in it outside
                // any slot is the part's own drawing (the Breadcrumb.Ellipsis inside <Pagination.Items />).
                else if (!slotted && owner.root?.el.selfClosing)
                    return exclude('inside-self-closing-part');
                // An owner that kept no element (Dialog.Action's own output is dropped as not drawn) leaves the place
                // it was put in.
                else if (owner.root) {
                    const k =
                        trail.map((t) => owner.byPart.get(partName(t))).findLast(Boolean) ??
                        owner.root;
                    // A part the template writes self-closing (<Table.Column />) holds nothing in code: Figma's
                    // nesting is not the code's there (Figma's Table is column-major), so the parent is left open.
                    at = k.el.selfClosing
                        ? { node: owner.root.node, any: true }
                        : { node: k.node, any: false };
                }
            }
            const kept: Kept[] = [];
            let top: BlueprintNode[];
            try {
                const texts = new Set<unknown>();
                const { example } = withContext(
                    { handle: handle(n), batch: c.entry.batch, texts },
                    catalog.runTemplate(c.entry),
                );
                const parts = drawn(n);
                top = parse(render(example), texts).children.flatMap((el) =>
                    keep(el, parts, c.entry.pkg, kept),
                );
            } catch (e) {
                unscorable.push({
                    node: n.id,
                    name: nameOf(n),
                    cause: 'template-error',
                    message: (e as Error).message,
                    ...boxed,
                });
                excludeIn(n, 'inside-unscorable');
                return;
            }
            // An outer template can render an instance that sits deeper in Figma (Table.Root renders the
            // ColumnGroup Figma nests in Table.Body), so what every owner above rendered carries down.
            const nested = new Map(owner?.nested);
            const byPart = new Map<string, Kept>();
            for (const [i, k] of kept.entries()) {
                k.node.id = i ? `${n.id}#${i}` : n.id;
                if (box) k.node.box = box;
                for (const id of k.el.nested) nested.set(id, k.node);
                byPart.set(partName(k.el.tag), k);
            }
            if (at?.any) for (const node of top) node.anyParent = true;
            (at ? at.node.children : nodes).push(...top);
            const root = kept[0];
            for (const ch of n.children ?? [])
                visit(
                    ch,
                    root ? { node: root.node, any: false } : at,
                    { name: nameOf(n), pkg: c.entry.pkg, nested, byPart, root },
                    [],
                    false,
                );
            return;
        }
        if (isLib(n)) {
            unscorable.push({ node: n.id, name: nameOf(n), cause: 'no-template', ...boxed });
            trail = [...trail, nameOf(n)];
        }
        for (const ch of n.children ?? []) visit(ch, at, owner, trail, slotted);
    }
    visit(document, null, null, [], false);
    const frame = document.absoluteBoundingBox;
    return {
        version: 3,
        ...(frame && { size: { w: frame.width, h: frame.height } }),
        nodes,
        excluded,
        unscorable,
        ...layers(document, isLib, variables),
        styles: variables ? 'ok' : 'no-variables-api',
    };
}
