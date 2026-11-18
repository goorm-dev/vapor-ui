import ts from 'typescript';

import type { Catalog, Entry } from '~/catalog/catalog';
import { NESTED_TAG, templateId, templateRunner } from '~/code-connect/stand-in';
import type { FigmaNode, FigmaTree } from '~/figma';
import { hasLibraryMarker, isCompositesKey } from '~/packages';
import type { Pkg } from '~/packages';

import { boxesIn, textsIn } from './design';
import type { Blueprint, BlueprintNode, Excluded, Unscorable } from './output';

interface Element {
    tag: string;
    attrs: string[];
    children: Element[];
    nested: string[];
    selfClosing: boolean;
}

interface Kept {
    el: Element;
    node: BlueprintNode;
}

type Place = { node: BlueprintNode; anyParent: boolean } | null;

interface Owner {
    name: string;
    pkg: Pkg;
    nested: Map<string, BlueprintNode>;
    byPart: Map<string, Kept>;
    root: Kept | undefined;
}

const ids = new WeakMap<Entry, string | null>();
const idOf = (catalog: Catalog, entry: Entry) => {
    if (!ids.has(entry))
        ids.set(
            entry,
            templateId(() => catalog.runTemplate(entry), entry.batch),
        );
    return ids.get(entry) ?? null;
};

type Jsx = ts.JsxElement | ts.JsxSelfClosingElement;
const open = (n: Jsx) => (ts.isJsxElement(n) ? n.openingElement : n);
const ANY_VALUE = '*';
const EXAMPLE_VALUE = '...';
function attrsOf(el: Jsx, copy: Set<unknown>) {
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
            const isCopy = k === 'aria-label' || copy.has(e.text);
            const v = isCopy ? ANY_VALUE : e.text;
            if (v === EXAMPLE_VALUE) continue;
            out.push(`${k}=${v.includes('"') ? `{${JSON.stringify(v)}}` : `"${v}"`}`);
        } else if (e?.kind === ts.SyntaxKind.TrueKeyword) out.push(k);
    }
    return out;
}
const isUsageHint = (n: Jsx, copy: Set<unknown>) =>
    ts.isJsxElement(n) &&
    !copy.has(EXAMPLE_VALUE) &&
    n.children
        .map((c) => c.getText())
        .join('')
        .trim() === EXAMPLE_VALUE;
function parse(code: string, copy: Set<unknown>) {
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
            if (tag === NESTED_TAG) {
                at.nested.push(attrsOf(n, copy)[0].slice(4, -1));
                return;
            }
            if (isUsageHint(n, copy)) return;
            const el: Element = {
                tag,
                attrs: attrsOf(n, copy),
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

const partKey = (name: string) =>
    name
        .replace(/^\W+/u, '')
        .replace(/\s+/g, '')
        .replace(/\.Root$/, '')
        .toLowerCase();
const byPartKey = (table: Record<string, string[]>) =>
    new Map(Object.entries(table).map(([k, v]) => [partKey(k), new Set(v.map(partKey))]));

export function blueprint(tree: FigmaTree, catalog: Catalog): Blueprint {
    const { entries } = catalog;
    // A design can hold an older copy of a library component under a key that is no longer published, and Figma still
    // connects it. ponytail: match those by name, only where the name is unique in the entries and the component comes
    // from a library (a design file's own "Dialog" is not one).
    const byName = new Map<string, Entry | null>();
    for (const e of Object.values(entries)) byName.set(e.name, byName.has(e.name) ? null : e);
    const ownIcons = byPartKey(catalog.tables.internalIcons);
    const partsDrawnByComposites = byPartKey(catalog.tables.internalParts);

    const { document, components = {}, componentSets = {} } = tree;
    const componentOf = (n: FigmaNode) => {
        const c = n.componentId === undefined ? undefined : components[n.componentId];
        const set = c?.componentSetId === undefined ? undefined : componentSets[c.componentSetId];
        return { c, set };
    };
    const nameOf = (n: FigmaNode) => {
        const { c, set } = componentOf(n);
        return set?.name ?? c?.name ?? n.name;
    };
    const fromComposites = (n: FigmaNode) => {
        const { c, set } = componentOf(n);
        return isCompositesKey(set?.key) || isCompositesKey(c?.key);
    };
    const hasComposites = Object.values(entries).some((e) => e.pkg === 'composites');
    const entryOf = (n: FigmaNode) => {
        const { c, set } = componentOf(n);
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
    const templates = templateRunner(connected);
    const nodes: BlueprintNode[] = [];
    const excluded: Excluded[] = [];
    const unscorable: Unscorable[] = [];
    const isLib = (n: FigmaNode) =>
        n.type === 'INSTANCE' &&
        (connected(n) !== null ||
            fromComposites(n) ||
            hasLibraryMarker(nameOf(n)) ||
            hasLibraryMarker(n.name));
    const boxOf = boxesIn(document);

    const drawn = (n: FigmaNode, out = new Set<string>()) => {
        if (n.visible === false) return out;
        if (isLib(n)) out.add(partKey(nameOf(n)));
        for (const c of n.children ?? []) drawn(c, out);
        return out;
    };
    const excludeIn = (n: FigmaNode, reason: Excluded['reason']) => {
        for (const c of n.children ?? []) {
            if (c.visible === false) continue;
            const box = boxOf(c.absoluteBoundingBox);
            if (isLib(c))
                excluded.push({ node: c.id, name: nameOf(c), reason, ...(box && { box }) });
            excludeIn(c, reason);
        }
    };
    const keep = (
        el: Element,
        parts: Set<string>,
        pkg: Pkg,
    ): { node?: BlueprintNode; kept: Kept[] } => {
        const below = el.children.map((c) => keep(c, parts, pkg));
        const children = below.flatMap((b) => b.node ?? []);
        if (!children.length && !el.nested.length && !parts.has(partKey(el.tag)))
            return { kept: [] };
        const node: BlueprintNode = { id: '', tag: el.tag, props: el.attrs, pkg, children };
        return { node, kept: [{ el, node }, ...below.flatMap((b) => b.kept)] };
    };

    function visit(
        n: FigmaNode,
        at: Place,
        owner: Owner | null,
        libsSinceOwner: string[],
        inSlot: boolean,
    ) {
        if (n.visible === false) return;
        if (n.type === 'SLOT' || (n.type === 'INSTANCE' && nameOf(n).startsWith('🟨')))
            inSlot = true;
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
                if (nestedIn) at = { node: nestedIn, anyParent: false };
                else if (
                    ownIcons
                        .get(partKey(libsSinceOwner.at(-1) ?? owner.name))
                        ?.has(partKey(nameOf(n)))
                )
                    return exclude('part-draws-icon');
                else if (
                    owner.pkg === 'composites' &&
                    !inSlot &&
                    partsDrawnByComposites.get(partKey(owner.name))?.has(partKey(nameOf(n)))
                )
                    return exclude('part-draws-itself');
                else if (!inSlot && owner.root?.el.selfClosing)
                    return exclude('inside-self-closing-part');
                else if (owner.root) {
                    const k =
                        libsSinceOwner.map((t) => owner.byPart.get(partKey(t))).findLast(Boolean) ??
                        owner.root;
                    at = k.el.selfClosing
                        ? { node: owner.root.node, anyParent: true }
                        : { node: k.node, anyParent: false };
                }
            }
            let kept: Kept[];
            let top: BlueprintNode[];
            try {
                const { code, copy } = templates.run(
                    n,
                    catalog.runTemplate(c.entry),
                    c.entry.batch,
                );
                const parts = drawn(n);
                const results = parse(code, copy).children.map((el) =>
                    keep(el, parts, c.entry.pkg),
                );
                kept = results.flatMap((r) => r.kept);
                top = results.flatMap((r) => r.node ?? []);
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
            const nested = new Map(owner?.nested);
            const byPart = new Map<string, Kept>();
            for (const [i, k] of kept.entries()) {
                k.node.id = i ? `${n.id}#${i}` : n.id;
                if (box) k.node.box = box;
                for (const id of k.el.nested) nested.set(id, k.node);
                byPart.set(partKey(k.el.tag), k);
            }
            if (at?.anyParent) for (const node of top) node.anyParent = true;
            (at ? at.node.children : nodes).push(...top);
            const root = kept[0];
            for (const ch of n.children ?? [])
                visit(
                    ch,
                    root ? { node: root.node, anyParent: false } : at,
                    { name: nameOf(n), pkg: c.entry.pkg, nested, byPart, root },
                    [],
                    false,
                );
            return;
        }
        if (n.type === 'INSTANCE' && fromComposites(n)) {
            unscorable.push({
                node: n.id,
                name: nameOf(n),
                cause: hasComposites ? 'no-template' : 'not-installed',
                ...(!hasComposites && {
                    message:
                        '@vapor-ui/composites is not installed or ships no figma-blueprint tables',
                }),
                ...boxed,
            });
            excludeIn(n, 'inside-unscorable');
            return;
        }
        if (isLib(n)) {
            unscorable.push({ node: n.id, name: nameOf(n), cause: 'no-template', ...boxed });
            libsSinceOwner = [...libsSinceOwner, nameOf(n)];
        }
        for (const ch of n.children ?? []) visit(ch, at, owner, libsSinceOwner, inSlot);
    }
    visit(document, null, null, [], false);
    const frame = document.absoluteBoundingBox;
    return {
        version: 4,
        ...(frame && { size: { w: frame.width, h: frame.height } }),
        nodes,
        excluded,
        unscorable,
        texts: textsIn(document),
    };
}
