import type { FigmaNode } from './types.ts';

export const ITEM_BASE_NAME = 'Item';
export const DO_NOT_EXPORT_MARKER = '(do not export)';

export const SLOT_NAMES = {
    sample: 'Sample',
    export: 'Export',
    preview: 'Preview',
    table: 'Table form',
} as const;

export const CASE_NAMES = {
    do: 'Do',
    dont: "Don't",
} as const;

export const TEXT_NAMES = {
    subtitle: 'section subtitle',
    body: 'body',
    caption: 'caption',
    componentName: 'component name',
    componentDescription: 'component description',
    listLabel: 'list label',
} as const;

export const LIST_INSTANCE_NAME = 'List text';

const BOLD_WEIGHT_THRESHOLD = 600;

export const HEADER_INSTANCE_NAME = 'Component guide/Header';
export const HEADER_TYPE_PROP = 'type';
export const HEADER_TYPE_COMPONENT_VALUE = 'component';

/** DFS canvas for the `Component guide/Header` INSTANCE whose `type` variant is `component`.
 *  Figma suffixes variant prop keys with `#<schemaId>`, so match by the segment before `#`. */
export function findComponentHeader(canvas: FigmaNode): FigmaNode | undefined {
    const walk = (n: FigmaNode): FigmaNode | undefined => {
        for (const child of n.children ?? []) {
            if (
                child.type === 'INSTANCE' &&
                child.name === HEADER_INSTANCE_NAME &&
                hasTypeComponent(child)
            ) {
                return child;
            }
            const nested = walk(child);
            if (nested) return nested;
        }
        return undefined;
    };
    return walk(canvas);
}

function hasTypeComponent(node: FigmaNode): boolean {
    const props = node.componentProperties;
    if (!props) return false;
    for (const [key, prop] of Object.entries(props)) {
        if (key.split('#')[0] !== HEADER_TYPE_PROP) continue;
        if (prop.value === HEADER_TYPE_COMPONENT_VALUE) return true;
    }
    return false;
}

/** True when the node is an `Item` component instance.
 *  Matches exact `Item` and variant forms (`Item ...`, `Item, Prop=Val`, `Item=Val`). */
export function isItemInstance(n: FigmaNode): boolean {
    if (n.type !== 'INSTANCE') return false;
    if (n.name === ITEM_BASE_NAME) return true;
    return (
        n.name.startsWith(`${ITEM_BASE_NAME} `) ||
        n.name.startsWith(`${ITEM_BASE_NAME},`) ||
        n.name.startsWith(`${ITEM_BASE_NAME}=`)
    );
}

/** `Item ... (do not export)` is excluded (sentinel marker in Figma name). */
export function isDoNotExport(n: FigmaNode): boolean {
    return n.name.includes(DO_NOT_EXPORT_MARKER);
}

/** Collect `Item` instances directly under `sectionFrame`, outermost first.
 *  `(do not export)` instances are skipped. Nested `Item` is not recursed into. */
export function findItems(sectionFrame: FigmaNode): FigmaNode[] {
    const out: FigmaNode[] = [];
    const walkOuter = (n: FigmaNode): void => {
        for (const child of n.children ?? []) {
            if (isItemInstance(child)) {
                if (!isDoNotExport(child)) out.push(child);
                continue;
            }
            walkOuter(child);
        }
    };
    walkOuter(sectionFrame);
    return out;
}

export type ItemChild =
    | { kind: 'subtitle'; text: string }
    | { kind: 'body'; text: string }
    | { kind: 'listItem'; markdown: string }
    | { kind: 'listGroup'; items: string[] }
    | { kind: 'sample'; node: FigmaNode }
    | { kind: 'preview'; node: FigmaNode }
    | { kind: 'table'; node: FigmaNode }
    | { kind: 'doCase'; node: FigmaNode }
    | { kind: 'dontCase'; node: FigmaNode };

/** Resolve the effective fontWeight for each UTF-16 code unit in a Figma TEXT
 *  node, wrap contiguous bold runs (weight ≥ 600) in `**…**`, and move the
 *  surrounding whitespace outside the markers so `**Close button: **` becomes
 *  `**Close button:** `. */
export function renderListLabelMarkdown(node: FigmaNode): string {
    const text = node.characters ?? '';
    if (!text) return '';
    const baseWeight = node.style?.fontWeight ?? 400;
    const overrides = node.characterStyleOverrides ?? [];
    const table = node.styleOverrideTable ?? {};
    const weightAt = (i: number): number => {
        const id = overrides[i];
        if (!id) return baseWeight;
        const w = table[String(id)]?.fontWeight;
        return w ?? baseWeight;
    };
    const isBold: boolean[] = [];
    for (let i = 0; i < text.length; i++) {
        isBold.push(weightAt(i) >= BOLD_WEIGHT_THRESHOLD);
    }
    const out: string[] = [];
    let i = 0;
    while (i < text.length) {
        const bold = isBold[i]!;
        let j = i;
        while (j < text.length && isBold[j] === bold) j++;
        const segment = text.slice(i, j);
        if (bold) {
            const m = segment.match(/^(\s*)([\s\S]*?)(\s*)$/);
            if (m && m[2]) out.push(`${m[1]}**${m[2]}**${m[3]}`);
            else out.push(segment);
        } else {
            out.push(segment);
        }
        i = j;
    }
    return out.join('').trim();
}

/** Collect every TEXT leaf under a `List text` INSTANCE and render each as a
 *  bullet's markdown. Leaf names vary (e.g. `body`, `list label`); the wrapper
 *  identity is what defines a bullet, so names are ignored. */
export function collectListTextItems(root: FigmaNode): string[] {
    const items: string[] = [];
    const walk = (n: FigmaNode): void => {
        for (const c of n.children ?? []) {
            if (c.type === 'TEXT') {
                if (!c.characters?.trim()) continue;
                const md = renderListLabelMarkdown(c);
                if (md) items.push(md);
                continue;
            }
            walk(c);
        }
    };
    walk(root);
    return items;
}

/** DFS `root`'s subtree for the first FRAME named `Export`. Direct-child `.find`
 *  misses the real target when designers wrap Export in a `Container` (or any other
 *  wrapper) before placing it inside a `Sample` slot. */
export function findExportFrame(root: FigmaNode): FigmaNode | undefined {
    for (const child of root.children ?? []) {
        if (child.name === SLOT_NAMES.export && child.type === 'FRAME') return child;
        const nested = findExportFrame(child);
        if (nested) return nested;
    }
    return undefined;
}

/** DFS the first TEXT node whose name matches, return its trimmed `characters`. */
export function findTextByName(root: FigmaNode, name: string): string | undefined {
    for (const child of root.children ?? []) {
        if (child.type === 'TEXT' && child.name === name) {
            const text = child.characters?.trim();
            if (text) return text;
        }
        const nested = findTextByName(child, name);
        if (nested) return nested;
    }
    return undefined;
}

/** Walk `item` children in document order; produce typed child records.
 *  - `(do not export)` INSTANCE: ignored (policy #3).
 *  - TEXT with name `section subtitle`: subtitle.
 *  - TEXT with name `body`: body.
 *  - Node with name `Sample` / `Preview` / `Table form`: slot (do not recurse past slot).
 *  - Other wrapper frames: recurse. */
export function parseItemChildren(item: FigmaNode): ItemChild[] {
    const out: ItemChild[] = [];
    const walkOrdered = (n: FigmaNode): void => {
        for (const child of n.children ?? []) {
            if (isItemInstance(child)) {
                // Nested Item — not expected; skip to avoid duplication.
                continue;
            }
            if (child.type === 'INSTANCE' && child.name.startsWith(DO_NOT_EXPORT_MARKER)) {
                continue;
            }
            if (child.type === 'TEXT') {
                if (child.name === TEXT_NAMES.subtitle && child.characters?.trim()) {
                    out.push({ kind: 'subtitle', text: child.characters.trim() });
                    continue;
                }
                if (child.name === TEXT_NAMES.body && child.characters?.trim()) {
                    out.push({ kind: 'body', text: child.characters.trim() });
                    continue;
                }
                if (child.name === TEXT_NAMES.listLabel && child.characters?.trim()) {
                    const markdown = renderListLabelMarkdown(child);
                    if (markdown) out.push({ kind: 'listItem', markdown });
                    continue;
                }
                continue;
            }
            if (child.name === SLOT_NAMES.sample) {
                out.push({ kind: 'sample', node: child });
                continue;
            }
            if (child.name === SLOT_NAMES.preview) {
                out.push({ kind: 'preview', node: child });
                continue;
            }
            if (child.name === SLOT_NAMES.table) {
                out.push({ kind: 'table', node: child });
                continue;
            }
            if (child.name === CASE_NAMES.do) {
                out.push({ kind: 'doCase', node: child });
                continue;
            }
            if (child.name === CASE_NAMES.dont) {
                out.push({ kind: 'dontCase', node: child });
                continue;
            }
            if (child.type === 'INSTANCE' && child.name === LIST_INSTANCE_NAME) {
                const items = collectListTextItems(child);
                if (items.length) out.push({ kind: 'listGroup', items });
                continue;
            }
            walkOrdered(child);
        }
    };
    walkOrdered(item);
    return out;
}
