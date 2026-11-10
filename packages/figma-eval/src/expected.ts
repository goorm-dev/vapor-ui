// Expected set of a Figma frame: one line per element the code must contain.
// Each visible Code Connect instance runs its own template against the REST node (figma-mock.ts) and contributes
// the elements its snippet draws itself. A connected instance inside another one counts only when the outer template
// renders it (executeTemplate marker) or it sits in a SLOT; otherwise the part draws it itself (Select.Trigger's chevron).
// Line rules: literal props only, no "false", no placeholder, aria-label → "*", data-in = tag of the element it sits in.
import ts from 'typescript';

import type { FigmaNode } from './figma-mock';
import { makeHandles, render, texts, withContext } from './figma-mock';
import type { Entry, Library, Pkg } from './library';

export interface FigmaTree {
    document: FigmaNode;
    components?: Record<string, { key: string; name: string; componentSetId?: string }>;
    componentSets?: Record<string, { key: string; name: string }>;
}

// pkg: the package whose template wrote the line, so a composites Dialog.Root is not met by core's.
export interface ExpectedLine {
    line: string;
    pkg: Pkg;
}

// A library instance the design draws that is not a line, and why.
export interface Excluded {
    node: string;
    name: string;
    reason: 'part-draws-icon' | 'part-draws-itself' | 'inside-self-closing-part';
}

// A library instance that could not be read, so the design cannot be graded.
export interface Unscorable {
    node: string;
    name: string;
    cause: 'no-template' | 'template-error';
    message?: string;
}

export interface ExpectedSet {
    lines: ExpectedLine[];
    excluded: Excluded[];
    unscorable: Unscorable[];
}

interface Element {
    tag: string;
    attrs: string[];
    children: Element[];
    nested: string[];
    selfClosing: boolean;
}

interface Kept extends Element {
    parent: string | null;
}

interface Owner {
    name: string;
    pkg: Pkg;
    nested: Map<string, string>;
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
const idOf = (library: Library, entry: Entry) => {
    if (!ids.has(entry)) {
        let id: string | null = null;
        try {
            id =
                withContext({ handle: dummy, batch: entry.batch }, library.runTemplate(entry)).id ??
                null;
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
function attrsOf(el: Jsx) {
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
            out.push(`${k}=${v.includes('"') ? `{${JSON.stringify(v)}}` : `"${v}"`}`);
        } else if (e?.kind === ts.SyntaxKind.TrueKeyword) out.push(k);
        // A number cannot come from a Figma property, so it is a template's example value (totalPages={10}).
        else if (e && ts.isNumericLiteral(e)) continue;
    }
    return out;
}
// One snippet as an element tree; a marker becomes the id of the nested instance in the element it sits in.
function parse(code: string) {
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
                at.nested.push(attrsOf(n)[0].slice(4, -1));
                return;
            }
            // <Button>...</Button> is a usage hint the template adds (Dialog's trigger), not something the design draws.
            if (
                ts.isJsxElement(n) &&
                n.children
                    .map((c) => c.getText())
                    .join('')
                    .trim() === '...'
            )
                return;
            const el: Element = {
                tag,
                attrs: attrsOf(n),
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
export function expectedSet(tree: FigmaTree, library: Library): ExpectedSet {
    const { entries } = library;
    // A design can hold an older copy of a library component under a key that is no longer published, and Figma still
    // connects it. ponytail: match those by name, only where the name is unique in the entries.
    const byName = new Map<string, Entry | null>();
    for (const e of Object.values(entries)) byName.set(e.name, byName.has(e.name) ? null : e);
    const ownIcons = byPartName(library.tables.internalIcons);
    const ownParts = byPartName(library.tables.internalParts);

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
        return c && ((set && entries[set.key]) ?? entries[c.key] ?? byName.get(nameOf(n)));
    };
    const connected = (n: FigmaNode) => {
        const e = n.type === 'INSTANCE' && entryOf(n);
        return e ? { id: idOf(library, e), entry: e } : null;
    };
    const handle = makeHandles({ connected });
    // One line per instance, so three identical Buttons in the design need three in the code.
    const lines: ExpectedLine[] = [];
    const excluded: Excluded[] = [];
    const unscorable: Unscorable[] = [];
    // A library instance is one the entries connect, or one named like a library component that nothing installed
    // connects: 💙 core, ❤️ icons, and 🩵 on a composites part's layer ("Dialog/🩵Action"). ponytail: an unprefixed
    // instance with no entry (a composites root when composites is not installed) only surfaces through its 🩵 layers.
    const marked = (s: string) => /(^|\/)(💙|❤️|🩵)/u.test(s);
    const isLib = (n: FigmaNode) =>
        n.type === 'INSTANCE' && (connected(n) !== null || marked(nameOf(n)) || marked(n.name));

    // Library parts the design draws in a node's subtree, the node included.
    const drawn = (n: FigmaNode, out = new Set<string>()) => {
        if (n.visible === false) return out;
        if (isLib(n)) out.add(partName(nameOf(n)));
        for (const c of n.children ?? []) drawn(c, out);
        return out;
    };
    // Of a snippet only the elements the design draws (or that hold one, or hold a nested instance) are expected.
    const keep = (el: Element, parts: Set<string>, parent: string | null, out: Kept[]) => {
        const below: Kept[] = [];
        for (const c of el.children) keep(c, parts, el.tag, below);
        if (below.length || el.nested.length || parts.has(partName(el.tag)))
            out.push({ ...el, parent }, ...below);
        return out;
    };
    const line = (tag: string, attrs: string[], parent: string | null) =>
        `<${[tag, ...attrs, ...(parent ? [`data-in="${parent}"`] : [])].join(' ')} />`;

    // owner: the nearest connected instance above, with the elements its snippet kept.
    // trail: names of the library instances passed since the owner, innermost last.
    // slotted: a SLOT node or a 🟨 slot layer was passed since the owner, the places a designer puts content.
    function visit(
        n: FigmaNode,
        parentTag: string | null,
        owner: Owner | null,
        trail: string[],
        slotted: boolean,
    ) {
        if (n.visible === false) return;
        if (n.type === 'SLOT' || (n.type === 'INSTANCE' && nameOf(n).startsWith('🟨')))
            slotted = true;
        const c = connected(n);
        if (c) {
            let parent = parentTag;
            const exclude = (reason: Excluded['reason']) =>
                void excluded.push({ node: n.id, name: nameOf(n), reason });
            if (owner) {
                const nestedIn = owner.nested.get(n.id);
                if (nestedIn !== undefined) parent = nestedIn;
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
                else if (!slotted && owner.root?.selfClosing)
                    return exclude('inside-self-closing-part');
                else {
                    const el =
                        trail.map((t) => owner.byPart.get(partName(t))).findLast(Boolean) ??
                        owner.root;
                    // A part the template writes self-closing (<Table.Column />) holds nothing in code: Figma's
                    // nesting is not the code's there (Figma's Table is column-major), so the parent is left open.
                    // No element at all (Dialog.Action's own template output is dropped as not drawn): keep the
                    // parent the owner was placed in.
                    parent = el ? (el.selfClosing ? null : el.tag) : parent;
                }
            }
            let kept: Kept[];
            try {
                texts.clear();
                const { example } = withContext(
                    { handle: handle(n), batch: c.entry.batch },
                    library.runTemplate(c.entry),
                );
                const parts = drawn(n);
                kept = parse(render(example)).children.flatMap((el) => keep(el, parts, null, []));
            } catch (e) {
                unscorable.push({
                    node: n.id,
                    name: nameOf(n),
                    cause: 'template-error',
                    message: (e as Error).message,
                });
                return;
            }
            // An outer template can render an instance that sits deeper in Figma (Table.Root renders the
            // ColumnGroup Figma nests in Table.Body), so what every owner above rendered carries down.
            const nested = new Map(owner?.nested);
            const byPart = new Map<string, Kept>();
            for (const el of kept) {
                lines.push({ line: line(el.tag, el.attrs, el.parent ?? parent), pkg: c.entry.pkg });
                for (const id of el.nested) nested.set(id, el.tag);
                byPart.set(partName(el.tag), el);
            }
            const rootTag = kept[0]?.tag ?? parent;
            for (const ch of n.children ?? [])
                visit(
                    ch,
                    rootTag,
                    { name: nameOf(n), pkg: c.entry.pkg, nested, byPart, root: kept[0] },
                    [],
                    false,
                );
            return;
        }
        if (isLib(n)) {
            unscorable.push({ node: n.id, name: nameOf(n), cause: 'no-template' });
            trail = [...trail, nameOf(n)];
        }
        for (const ch of n.children ?? []) visit(ch, parentTag, owner, trail, slotted);
    }
    visit(document, null, null, [], false);
    return { lines, excluded, unscorable };
}
