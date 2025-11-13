/**
 * IR Augmenter
 *
 * PRD 7.1: Raw IR을 Semantic IR로 보강
 * Phase 2: 메타데이터 기반 보강 완료
 */
import type { RawIR, SemanticIR } from '../../domain/types';
import type { ComponentMetadata } from '../../infrastructure/metadata';
import {
    applyComponentNameMapping,
    injectFunctionalComponents,
    optimizeNesting,
} from './transformers';

/**
 * Augmenter Options
 */
export interface AugmenterOptions {
    /**
     * 컴포넌트 메타데이터
     */
    metadata?: ComponentMetadata;

    /**
     * Nesting 최적화 활성화 여부
     */
    optimizeNesting?: boolean;
}

/**
 * IR 보강 함수 생성
 *
 * Phase 2: 메타데이터 기반 IR 보강 파이프라인
 *
 * @param options - Augmenter 옵션
 * @returns Augment 함수
 */
export function createAugmenter(options: AugmenterOptions = {}) {
    const { metadata, optimizeNesting: shouldOptimize = true } = options;

    const augment = (rawIR: RawIR): SemanticIR => {
        let transformedIR = rawIR;

        // [1] Functional Component 주입 (Figma 이름 기준, 메타데이터가 있을 경우)
        if (metadata) {
            transformedIR = injectFunctionalComponents(transformedIR, metadata);
        }

        // [2] Component Name Mapping (Figma 이름 → Vapor-UI 이름)
        if (metadata) {
            transformedIR = applyComponentNameMapping(transformedIR, metadata);
        }

        // [3] Nesting 최적화
        if (shouldOptimize) {
            transformedIR = optimizeNesting(transformedIR);
        }

        // [4] Imports 수집
        const { imports, iconImports } = collectImports(transformedIR);

        return {
            ...transformedIR,
            imports,
            iconImports,
        };
    };

    return augment;
}

/**
 * IR 트리에서 필요한 imports 수집
 *
 * @param ir - Raw IR
 * @returns { imports: 일반 컴포넌트, iconImports: 아이콘 컴포넌트 }
 */
function collectImports(ir: RawIR): { imports: Set<string>; iconImports: Set<string> } {
    const imports = new Set<string>();
    const iconImports = new Set<string>();

    // 재귀적으로 컴포넌트 이름 수집
    const collectComponentNames = (node: RawIR | string) => {
        if (typeof node === 'string') return;

        // 아이콘 여부 확인
        const isIcon = node.metadata?.isIcon === true;

        // 컴포넌트 타입이면 imports에 추가
        if (node.type === 'component') {
            if (isIcon) {
                iconImports.add(node.componentName);
            } else {
                imports.add(node.componentName);
            }
        } else if (node.type === 'element') {
            // Flex, Box 등 레이아웃 컴포넌트
            imports.add(node.componentName);
        } else if (node.type === 'text') {
            // Text 컴포넌트
            imports.add(node.componentName);
        }

        // 자식 순회
        node.children.forEach(collectComponentNames);
    };

    collectComponentNames(ir);

    return { imports, iconImports };
}
