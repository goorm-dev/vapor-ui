/**
 * Tree Traverser
 *
 * PRD 6.1: Figma 노드 트리를 순회하여 Raw IR 생성
 */

import type { FigmaNode, RawIR } from '../../domain/types';
import { applyFilters } from '../../domain/rules';
import { mapComponentNode, mapTextNode, mapLayoutNode } from './mappers';
import { FIGMA_COMPONENT_PREFIX } from '../../domain/constants';

/**
 * Mapper 선택
 *
 * 노드 타입과 이름을 기반으로 적절한 매퍼 선택
 */
function selectMapper(node: FigmaNode): (node: FigmaNode) => RawIR {
    // [1] Component/Instance → Component Mapper
    if ((node.type === 'COMPONENT' || node.type === 'INSTANCE') && node.name.startsWith(FIGMA_COMPONENT_PREFIX)) {
        return mapComponentNode;
    }

    // [2] Text → Text Mapper
    if (node.type === 'TEXT') {
        return mapTextNode;
    }

    // [3] AutoLayout (Frame) → Layout Mapper
    if (
        node.type === 'FRAME' &&
        node.layoutMode &&
        node.layoutMode !== 'NONE'
    ) {
        return mapLayoutNode;
    }

    // [4] 기본: Layout Mapper (일반 컨테이너)
    return mapLayoutNode;
}

/**
 * 트리 순회 함수 생성
 *
 * PRD 6.1: Figma 노드 트리를 재귀적으로 순회하여 Raw IR 생성
 */
export function createTraverser() {
    /**
     * 재귀 순회 함수
     */
    const traverse = (node: FigmaNode): RawIR | RawIR[] | null => {
        // [Filter] 노드 필터링
        const filterResult = applyFilters(node);

        if (filterResult.action === 'skip') {
            return null;
        }

        if (filterResult.action === 'unwrap-children') {
            // ContentLayer 등 투명 컨테이너 → 자식만 반환
            if (!node.children || node.children.length === 0) {
                return null;
            }

            const childIRs = node.children
                .map(traverse)
                .flat()
                .filter((ir): ir is RawIR => ir !== null);

            return childIRs;
        }

        // [Map] 노드 타입별 매핑
        const mapper = selectMapper(node);
        const ir = mapper(node);

        // [Recurse] 자식 순회
        if (node.children && node.children.length > 0) {
            const childIRs = node.children
                .map(traverse)
                .flat()
                .filter((ir): ir is RawIR => ir !== null);

            ir.children = childIRs;
        }

        return ir;
    };

    return traverse;
}
