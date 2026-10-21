import type { FigmaNode } from './types.ts';

export const ITEM_BASE_NAME = 'Item';
export const DO_NOT_EXPORT_MARKER = '(do not export)';
const TEXT_SKIP_PREFIX = 'Text - x';

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
} as const;

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
    | { kind: 'sample'; node: FigmaNode }
    | { kind: 'preview'; node: FigmaNode }
    | { kind: 'table'; node: FigmaNode }
    | { kind: 'doCase'; node: FigmaNode }
    | { kind: 'dontCase'; node: FigmaNode };

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
 *  - `Text - x*` INSTANCE: ignored (policy #3).
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
            if (child.type === 'INSTANCE' && child.name.startsWith(TEXT_SKIP_PREFIX)) {
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
            walkOrdered(child);
        }
    };
    walkOrdered(item);
    return out;
}
