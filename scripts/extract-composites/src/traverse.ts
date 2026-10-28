import { SLOT_NAMES } from './constants.ts';
import type { FigmaNode } from './model.ts';

/** `Sample` slot 안의 Export FRAME을 DFS로 찾는다. 디자이너가 Export를 `Container` 같은
 *  wrapper로 감쌀 때 direct-child `.find`는 놓치기 때문에 재귀가 필요하다. */
export function findExportFrame(root: FigmaNode): FigmaNode | undefined {
    for (const child of root.children ?? []) {
        if (child.name === SLOT_NAMES.export && child.type === 'FRAME') return child;
        const nested = findExportFrame(child);
        if (nested) return nested;
    }
    return undefined;
}

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
