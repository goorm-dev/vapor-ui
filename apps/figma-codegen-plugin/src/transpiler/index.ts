/**
 * Figma to React Transpiler
 *
 * PRD 9: Public API
 */

import type { FigmaNode, RawIR, SemanticIR } from '../domain/types';
import { createTraverser } from '../pipeline/1-parse/traverse';
import { createAugmenter } from '../pipeline/2-transform/augment';
import { generateReactCode, type CodegenOptions } from '../pipeline/3-generate/codegen';

/**
 * Transpiler Options
 */
export interface TranspilerOptions {
    componentName?: string;
    format?: boolean;
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
 * @param options - Transpiler 옵션
 * @returns Transpiler 인스턴스
 */
export async function createTranspiler(
    options: TranspilerOptions = {},
): Promise<Transpiler> {
    // 1. 파이프라인 단계 생성
    const parse = createTraverser();
    const transform = createAugmenter();

    // 2. 원샷 변환 함수
    const transpile = async (node: FigmaNode): Promise<string> => {
        // Stage 1: Parse (Figma → Raw IR)
        const rawIR = parse(node);

        if (!rawIR) {
            throw new Error('Failed to parse Figma node');
        }

        // 배열인 경우 첫 번째 요소 사용 (unwrap-children 결과)
        const singleRawIR = Array.isArray(rawIR) ? rawIR[0] : rawIR;

        if (!singleRawIR) {
            throw new Error('Empty IR result');
        }

        // Stage 2: Transform (Raw IR → Semantic IR)
        const semanticIR = transform(singleRawIR);

        // Stage 3: Generate (Semantic IR → React Code)
        const codegenOptions: CodegenOptions = {
            componentName: options.componentName,
            format: options.format ?? true,
        };

        return generateReactCode(semanticIR, codegenOptions);
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
