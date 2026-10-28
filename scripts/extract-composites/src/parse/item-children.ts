import {
    BOLD_WEIGHT_THRESHOLD,
    CASE_NAMES,
    DO_NOT_EXPORT_MARKER,
    LIST_INSTANCE_NAME,
    SLOT_NAMES,
    TEXT_NAMES,
} from '../constants.ts';
import type { FigmaNode } from '../model.ts';
import { isItemInstance } from './items.ts';

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

export function parseItemChildren(item: FigmaNode): ItemChild[] {
    const out: ItemChild[] = [];
    const walkOrdered = (n: FigmaNode): void => {
        for (const child of n.children ?? []) {
            if (isItemInstance(child)) {
                // Item 안의 Item은 중복 수집 방지 차원에서 건너뛴다.
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

/** TEXT 노드의 UTF-16 code unit 단위로 bold run을 감지해 `**…**`로 감싼다. 공백은 marker
 *  바깥으로 밀어 `**Close button: **`가 `**Close button:** `가 되도록 처리한다. */
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

/** `List text` INSTANCE 밑의 TEXT leaf를 bullet 하나씩으로 뽑는다. leaf 이름이 `body`,
 *  `list label` 등 혼재하므로 wrapper 정체성만 보고 이름은 무시한다. */
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
