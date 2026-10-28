import { DO_NOT_EXPORT_MARKER, ITEM_BASE_NAME } from '../../shared/constants.ts';
import type { FigmaNode } from '../../shared/types.ts';

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
