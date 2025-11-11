/**
 * Figma to React Transpiler
 *
 * PRD 9: Public API
 * Phase 2: 메타데이터 지원 추가
 *
 * ✅ TypeScript 메타데이터: 직접 import 방식 사용
 */

import type { FigmaNode, RawIR, SemanticIR } from '../domain/types';
import type { ComponentMetadata } from '../infrastructure/metadata';
import { metadata as defaultMetadata, validateMetadata } from '../infrastructure/metadata';
import { createTraverser } from '../pipeline/1-parse/traverse';
import { createAugmenter } from '../pipeline/2-transform/augment';
import { generateReactCode, type CodegenOptions } from '../pipeline/3-generate/codegen';

/**
 * Transpiler Options
 */
export interface TranspilerOptions {
    /**
     * 생성할 컴포넌트 이름
     */
    componentName?: string;

    /**
     * 코드 포맷팅 활성화 여부
     */
    format?: boolean;

    /**
     * ✅ 메타데이터 객체 (직접 전달)
     * PRD 9: TypeScript 메타데이터를 직접 import하여 전달
     *
     * @example
     * import { metadata } from './infrastructure/metadata/component.metadata';
     * createTranspiler({ metadata });
     *
     * 전달하지 않으면 기본 메타데이터 사용
     */
    metadata?: ComponentMetadata;

    /**
     * Nesting 최적화 활성화 여부
     */
    optimizeNesting?: boolean;
}

/**
 * Transpiler 인터페이스
 */
export interface Transpiler {
    /**
     * Figma 노드를 React 코드로 변환 (원샷)
     */
    transpile: (node: FigmaNode) => Promise<string>;

    /**
     * Figma 노드를 Raw IR로 변환 (디버깅용)
     */
    toRawIR: (node: FigmaNode) => RawIR | RawIR[] | null;

    /**
     * Figma 노드를 Semantic IR로 변환 (디버깅용)
     */
    toSemanticIR: (node: FigmaNode) => SemanticIR | null;
}

/**
 * Transpiler 생성
 *
 * Phase 2: 메타데이터 지원 및 에러 핸들링 강화
 *
 * ✅ PRD 9: 직접 import 방식 사용 (JSON 로딩 제거)
 *
 * @param options - Transpiler 옵션
 * @returns Transpiler 인스턴스
 */
export async function createTranspiler(
    options: TranspilerOptions = {},
): Promise<Transpiler> {
    // 1. 메타데이터 준비 (직접 import 방식)
    const metadata: ComponentMetadata = options.metadata ?? defaultMetadata;

    // 메타데이터 검증
    const validation = validateMetadata(metadata);
    if (!validation.valid) {
        console.warn('Metadata validation failed:', validation.errors);
        console.warn('Using provided metadata anyway (validation is non-blocking)');
    }

    // 2. 파이프라인 단계 생성
    const parse = createTraverser();
    const transform = createAugmenter({
        metadata,
        optimizeNesting: options.optimizeNesting ?? true,
    });

    // 3. 원샷 변환 함수
    const transpile = async (node: FigmaNode): Promise<string> => {
        try {
            // Stage 1: Parse (Figma → Raw IR)
            const rawIR = parse(node);

            if (!rawIR) {
                throw new Error(
                    'Failed to parse Figma node. The node may be filtered out by the filter rules.',
                );
            }

            // 배열인 경우 첫 번째 요소 사용 (unwrap-children 결과)
            const singleRawIR = Array.isArray(rawIR) ? rawIR[0] : rawIR;

            if (!singleRawIR) {
                throw new Error(
                    'Empty IR result. The node may have been unwrapped but has no valid children.',
                );
            }

            // Stage 2: Transform (Raw IR → Semantic IR)
            const semanticIR = transform(singleRawIR);

            // Stage 3: Generate (Semantic IR → React Code)
            const codegenOptions: CodegenOptions = {
                componentName: options.componentName,
                format: options.format ?? true,
            };

            return generateReactCode(semanticIR, codegenOptions);
        } catch (error) {
            // 에러 정보 개선
            if (error instanceof Error) {
                throw new Error(`Transpilation failed: ${error.message}`);
            }
            throw new Error('Transpilation failed with unknown error');
        }
    };

    // 3. 디버깅용 API
    const toRawIR = (node: FigmaNode): RawIR | RawIR[] | null => {
        return parse(node);
    };

    const toSemanticIR = (node: FigmaNode): SemanticIR | null => {
        const rawIR = parse(node);
        if (!rawIR) return null;

        const singleRawIR = Array.isArray(rawIR) ? rawIR[0] : rawIR;
        if (!singleRawIR) return null;

        return transform(singleRawIR);
    };

    return {
        transpile,
        toRawIR,
        toSemanticIR,
    };
}
