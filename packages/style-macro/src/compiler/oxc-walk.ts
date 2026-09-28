import type { AnyProp } from '~/model/types';

/**
 * Visitor 는 노드 방문 시 자기 자신을 제외한 조상 스택을 받는다 (top-down 구조).
 * parents[parents.length - 1] 이 직계 부모.
 */
export type Visitor = (node: AnyProp, parents: AnyProp[]) => void;
export type Visitors = Record<string, Visitor>;

function isNode(value: unknown): value is { type: string } {
    return (
        typeof value === 'object' && value !== null && typeof (value as AnyProp).type === 'string'
    );
}

export function walk(node: unknown, visitors: Visitors, parents: AnyProp[] = []): void {
    if (!isNode(node)) return;

    parents.push(node);
    for (const key of Object.keys(node)) {
        if (
            key === 'type' ||
            key === 'start' ||
            key === 'end' ||
            key === 'loc' ||
            key === 'range'
        ) {
            continue;
        }
        const child = (node as AnyProp)[key];
        if (Array.isArray(child)) {
            for (const item of child) walk(item, visitors, parents);
        } else {
            walk(child, visitors, parents);
        }
    }
    parents.pop();

    const visitor = visitors[(node as AnyProp).type];
    if (visitor) visitor(node, parents);
}
