import { DO_NOT_EXPORT_MARKER, ITEM_BASE_NAME } from '../constants.ts';
import type { FigmaNode } from '../model.ts';

export function isItemInstance(n: FigmaNode): boolean {
    if (n.type !== 'INSTANCE') return false;
    if (n.name === ITEM_BASE_NAME) return true;
    return (
        n.name.startsWith(`${ITEM_BASE_NAME} `) ||
        n.name.startsWith(`${ITEM_BASE_NAME},`) ||
        n.name.startsWith(`${ITEM_BASE_NAME}=`)
    );
}

export function isDoNotExport(n: FigmaNode): boolean {
    return n.name.includes(DO_NOT_EXPORT_MARKER);
}

/** section frame 바로 아래의 최상위 Item만 수집한다. Item 내부에 또 다른 Item이 있어도
 *  재귀하지 않는다. */
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
