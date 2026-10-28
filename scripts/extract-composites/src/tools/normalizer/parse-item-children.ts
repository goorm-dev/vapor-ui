import {
    BOLD_WEIGHT_THRESHOLD,
    CASE_NAMES,
    DO_NOT_EXPORT_MARKER,
    LIST_INSTANCE_NAME,
    SLOT_NAMES,
    TEXT_NAMES,
} from '../../shared/constants.ts';
import type { FigmaNode } from '../../shared/types.ts';
import { isItemInstance } from '../analyzer/index.ts';

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
