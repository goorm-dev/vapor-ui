import { isVectorLike } from '../filters';
import type { NodeGuard } from './types';

export const isText: NodeGuard = {
    name: 'isText',
    test: (node) => node.type === 'TEXT',
};

/** 벡터 원시 노드 — 크기가 도형 자체 속성이라 dimension 검사 제외 (filters.ts 규칙 재사용). */
export const notVectorLike: NodeGuard = {
    name: 'notVectorLike',
    test: (node) => !isVectorLike(node),
};

export const notRoot: NodeGuard = {
    name: 'notRoot',
    test: (node, ctx) => node.id !== ctx.rootId,
};

/** FIXED sizing 축만 dimension 토큰 검사 대상. */
export const sizingFixed = (
    axis: 'layoutSizingHorizontal' | 'layoutSizingVertical',
): NodeGuard => ({
    name: `sizingFixed:${axis}`,
    test: (node) => (node as unknown as Record<string, unknown>)[axis] === 'FIXED',
});
