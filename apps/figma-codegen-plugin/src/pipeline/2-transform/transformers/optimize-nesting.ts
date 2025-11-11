/**
 * Nesting Optimization Transformer
 *
 * 불필요한 중첩 구조를 최적화
 */

import type { RawIR } from '../../../domain/types';

/**
 * Nesting 최적화 변환기
 *
 * 불필요한 Flex/Box 래퍼를 제거하고 평탄화
 *
 * @param ir - Raw IR
 * @returns 최적화된 IR
 */
export function optimizeNesting(ir: RawIR): RawIR {
    const result = flattenUnnecessaryWrappers(ir);

    // Type guard: result가 string이면 오류
    if (typeof result === 'string') {
        throw new Error('Unexpected string result in nesting optimization');
    }

    return result;
}

/**
 * 불필요한 래퍼 평탄화
 *
 * 규칙:
 * 1. 자식이 하나뿐인 Flex/Box는 제거 가능 (스타일 props가 없을 경우)
 * 2. 동일한 컴포넌트가 연속으로 중첩된 경우 병합
 *
 * @param node - IR 노드
 * @returns 최적화된 노드
 */
function flattenUnnecessaryWrappers(node: RawIR | string): RawIR | string {
    // 문자열 노드는 그대로 반환
    if (typeof node === 'string') {
        return node;
    }

    // 자식 먼저 최적화 (bottom-up)
    const optimizedChildren = node.children
        .map((child) => flattenUnnecessaryWrappers(child))
        .filter((child) => child !== null);

    // 현재 노드 업데이트
    const currentNode: RawIR = {
        ...node,
        children: optimizedChildren,
    };

    // [규칙 1] 단일 자식 + 스타일 없는 Flex/Box 제거
    if (shouldFlattenSingleChild(currentNode)) {
        const singleChild = currentNode.children[0];
        // 자식이 문자열이 아닌 경우에만 평탄화
        if (typeof singleChild !== 'string') {
            return singleChild;
        }
    }

    // [규칙 2] 동일 컴포넌트 중첩 병합
    if (shouldMergeDuplicateNesting(currentNode)) {
        return mergeDuplicateNesting(currentNode);
    }

    return currentNode;
}

/**
 * 단일 자식 평탄화 여부 판단
 *
 * @param node - IR 노드
 * @returns 평탄화 가능 여부
 */
function shouldFlattenSingleChild(node: RawIR): boolean {
    // Flex나 Box 컴포넌트이고
    const isLayoutComponent = node.componentName === 'Flex' || node.componentName === 'Box';

    // 자식이 정확히 하나이고
    const hasSingleChild = node.children.length === 1;

    // Sprinkles props가 없으면 평탄화 가능
    const hasNoStyleProps = Object.keys(node.props).length === 0;

    return isLayoutComponent && hasSingleChild && hasNoStyleProps;
}

/**
 * 중복 중첩 병합 여부 판단
 *
 * @param node - IR 노드
 * @returns 병합 가능 여부
 */
function shouldMergeDuplicateNesting(node: RawIR): boolean {
    // 자식이 하나이고
    if (node.children.length !== 1) return false;

    const child = node.children[0];

    // 자식이 문자열이 아니고
    if (typeof child === 'string') return false;

    // 부모와 자식이 동일한 컴포넌트이고
    if (node.componentName !== child.componentName) return false;

    // Layout 컴포넌트인 경우만 병합
    const isLayoutComponent = node.componentName === 'Flex' || node.componentName === 'Box';

    return isLayoutComponent;
}

/**
 * 중복 중첩 병합
 *
 * @param node - IR 노드
 * @returns 병합된 노드
 */
function mergeDuplicateNesting(node: RawIR): RawIR {
    const child = node.children[0];

    if (typeof child === 'string') {
        return node;
    }

    // 부모와 자식의 props 병합 (자식 우선)
    const mergedProps = {
        ...node.props,
        ...child.props,
    };

    return {
        ...node,
        props: mergedProps,
        children: child.children,
    };
}
