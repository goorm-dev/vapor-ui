/**
 * Code Generator
 *
 * PRD 8.1: Semantic IR을 React 코드로 생성
 */

import type { SemanticIR } from '../../domain/types';
import { generateImports, generateJSX } from './builders';
import { formatCode } from './formatter';

/**
 * Codegen Options
 */
export interface CodegenOptions {
    componentName?: string;
    format?: boolean;
}

/**
 * React 코드 생성
 *
 * @param ir - Semantic IR
 * @param options - Codegen 옵션
 * @returns React 코드 문자열
 */
export async function generateReactCode(
    ir: SemanticIR,
    options: CodegenOptions = {},
): Promise<string> {
    const { componentName = 'GeneratedComponent', format = true } = options;

    // 1. Import 문 생성
    const imports = generateImports(ir.imports);

    // 2. JSX 생성 (재귀)
    const jsx = generateJSX(ir, 2); // depth 2로 시작 (return 문 내부)

    // 3. 컴포넌트 조합
    const code = `${imports}

export default function ${componentName}() {
  return (
${jsx}
  );
}
`;

    // 4. 포맷팅 (선택적)
    if (format) {
        return formatCode(code);
    }

    return code;
}
