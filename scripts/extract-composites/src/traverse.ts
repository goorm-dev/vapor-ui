import type { FigmaNode } from './shared/types.ts';

export function walk(node: FigmaNode, visit: (n: FigmaNode, path: FigmaNode[]) => void): void {
    const stack: Array<{ node: FigmaNode; path: FigmaNode[] }> = [{ node, path: [] }];
    while (stack.length) {
        const { node: cur, path } = stack.pop()!;
        visit(cur, path);
        for (const child of cur.children ?? []) {
            stack.push({ node: child, path: [...path, cur] });
        }
    }
}

export function findDescendants(
    node: FigmaNode,
    predicate: (n: FigmaNode) => boolean,
): FigmaNode[] {
    const out: FigmaNode[] = [];
    walk(node, (n) => {
        if (n !== node && predicate(n)) out.push(n);
    });
    return out;
}

export function findFirstChild(
    node: FigmaNode,
    predicate: (n: FigmaNode) => boolean,
): FigmaNode | undefined {
    return (node.children ?? []).find(predicate);
}

/** Find all Sample-named descendants, keeping outermost when nested. */
export function findSamples(root: FigmaNode): FigmaNode[] {
    const samples: FigmaNode[] = [];
    const visited = new Set<FigmaNode>();
    const walkOuter = (n: FigmaNode): void => {
        if (visited.has(n)) return;
        visited.add(n);
        if (n !== root && n.name === 'Sample') {
            samples.push(n);
            return; // skip inner Sample nodes
        }
        for (const child of n.children ?? []) walkOuter(child);
    };
    walkOuter(root);
    return samples;
}

/** Find all content-item nodes, keeping outermost when nested.
 *
 *  Matches both the new `Item` INSTANCE wrapper and the legacy
 *  `Component guide/Content block` INSTANCE/FRAME, so sections that still mix the two
 *  layouts are emitted in document order without silently dropping the legacy entries. */
export function findItems(root: FigmaNode): FigmaNode[] {
    const items: FigmaNode[] = [];
    const isItemNode = (n: FigmaNode): boolean => {
        if (n.name === 'Item' && n.type === 'INSTANCE') return true;
        if (
            n.name === 'Component guide/Content block' ||
            n.name === 'Component Guide/Content block'
        )
            return true;
        return false;
    };
    const walkOuter = (n: FigmaNode): void => {
        if (n !== root && isItemNode(n)) {
            items.push(n);
            return; // skip nested item nodes
        }
        for (const child of n.children ?? []) walkOuter(child);
    };
    walkOuter(root);
    return items;
}

/** Find nearest ancestor matching predicate within a bounded ancestry list. */
export function nearestAncestor(
    ancestors: FigmaNode[],
    predicate: (n: FigmaNode) => boolean,
): FigmaNode | undefined {
    for (let i = ancestors.length - 1; i >= 0; i--) {
        const anc = ancestors[i]!;
        if (predicate(anc)) return anc;
    }
    return undefined;
}

export function collectAncestorsMap(root: FigmaNode): Map<string, FigmaNode[]> {
    const map = new Map<string, FigmaNode[]>();
    walk(root, (n, path) => {
        map.set(n.id, path);
    });
    return map;
}
