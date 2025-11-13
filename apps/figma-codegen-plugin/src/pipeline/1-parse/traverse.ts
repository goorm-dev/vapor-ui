/**
 * Tree Traverser
 *
 * PRD 6.1: Figma 노드 트리를 순회하여 Raw IR 생성
 */
import { FIGMA_COMPONENT_PREFIX, FIGMA_LAYER_PREFIX } from '../../domain/constants';
import { applyFilters } from '../../domain/rules';
import type { FigmaNode, RawIR } from '../../domain/types';
import { mapComponentNode, mapIconNode, mapLayoutNode, mapTextNode } from './mappers';

/**
 * Mapper 선택
 *
 * 노드 타입과 이름을 기반으로 적절한 매퍼 선택
 */
function selectMapper(node: FigmaNode): (node: FigmaNode) => RawIR {
    // [1] Icon 체크 (모든 타입에서 우선 확인)
    // ❤️ prefix가 있으면 무조건 아이콘
    if (node.name.startsWith(FIGMA_LAYER_PREFIX.ICON)) {
        return mapIconNode;
    }

    // [2] Component/Instance → Component Mapper (💙 prefix)
    if (
        (node.type === 'COMPONENT' || node.type === 'INSTANCE') &&
        node.name.startsWith(FIGMA_COMPONENT_PREFIX)
    ) {
        return mapComponentNode;
    }

    // [3] Text → Text Mapper
    if (node.type === 'TEXT') {
        return mapTextNode;
    }

    // [4] Icon → Icon Mapper (VECTOR 타입의 아이콘)
    const vectorTypes: FigmaNode['type'][] = ['VECTOR', 'LINE', 'STAR', 'ELLIPSE'];
    if (vectorTypes.includes(node.type)) {
        // "icon" 키워드나 이모지로 시작하는 경우
        const isIcon =
            node.name.toLowerCase().includes('icon') || /^[\u{1F300}-\u{1F9FF}]/u.test(node.name);

        if (isIcon) {
            return mapIconNode;
        }
    }

    // [5] AutoLayout (Frame) → Layout Mapper
    if (node.type === 'FRAME' && node.layoutMode && node.layoutMode !== 'NONE') {
        return mapLayoutNode;
    }

    // [6] 기본: Layout Mapper (일반 컨테이너)
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
