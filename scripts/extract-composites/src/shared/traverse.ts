import { SLOT_NAMES } from './constants.ts';
import type { FigmaNode } from './types.ts';

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
