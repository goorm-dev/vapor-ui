/**
 * IR Augmenter
 *
 * PRD 7.1: Raw IR을 Semantic IR로 보강
 * Phase 1: Pass-through (메타데이터 기반 보강은 Phase 2에서 구현)
 */

import type { RawIR, SemanticIR } from '../../domain/types';

/**
 * IR 보강 함수 생성
 *
 * Phase 1: 단순히 Raw IR을 Semantic IR로 변환 (imports 추가)
 * Phase 2에서 메타데이터 기반 보강 로직 추가 예정
 */
export function createAugmenter() {
    const augment = (rawIR: RawIR): SemanticIR => {
        // Phase 1: 기본 imports 수집만 수행
        const imports = collectImports(rawIR);

        return {
            ...rawIR,
            imports,
        };
    };

    return augment;
}

/**
 * IR 트리에서 필요한 imports 수집
 *
 * @param ir - Raw IR
 * @returns Import 문자열 Set
 */
function collectImports(ir: RawIR): Set<string> {
    const imports = new Set<string>();

    // 재귀적으로 컴포넌트 이름 수집
    const collectComponentNames = (node: RawIR | string) => {
        if (typeof node === 'string') return;

        // 컴포넌트 타입이면 imports에 추가
        if (node.type === 'component') {
            imports.add(node.componentName);
        } else if (node.type === 'element') {
            // Flex, Box 등 레이아웃 컴포넌트
            imports.add(node.componentName);
        }

        // 자식 순회
        node.children.forEach(collectComponentNames);
    };

    collectComponentNames(ir);

    return imports;
}
