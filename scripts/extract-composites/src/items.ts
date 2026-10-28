import {
    HEADER_INSTANCE_NAME,
    HEADER_TYPE_COMPONENT_VALUE,
    HEADER_TYPE_PROP,
    SLOT_NAMES,
} from './shared/constants.ts';
import type { FigmaNode } from './shared/types.ts';

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
