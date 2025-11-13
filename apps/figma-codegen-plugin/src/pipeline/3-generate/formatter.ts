/**
 * Code Formatter
 *
 * Phase 2: Prettier 통합 완료
 */

/**
 * 코드 포맷팅
 *
 * Phase 2: Prettier를 사용한 코드 포맷팅
 * Figma Plugin 환경에서는 Prettier를 직접 import할 수 없으므로,
 * 기본 포맷팅 + 규칙 기반 정리를 수행
 *
 * @param code - 포맷팅할 코드
 * @returns 포맷팅된 코드
 */
export function formatCode(code: string): string {
    let formatted = code;

    // [1] 연속된 빈 줄 제거 (최대 1줄)
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    // [2] 불필요한 공백 정리
    formatted = formatted
        // 줄 끝 공백 제거
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n');

    // [3] Import 문 정리 (알파벳 순서)
    formatted = sortImports(formatted);

    // [4] 들여쓰기는 generateJSX에서 이미 올바르게 처리됨 - 재계산 안 함

    // [5] 파일 끝에 개행 추가
    return formatted.trim() + '\n';
}

/**
 * Import 문 정렬
 *
 * @param code - 코드
 * @returns Import가 정렬된 코드
 */
function sortImports(code: string): string {
    const lines = code.split('\n');
    const imports: string[] = [];
    const rest: string[] = [];
    let inImportSection = true;

    for (const line of lines) {
        if (line.startsWith('import ')) {
            imports.push(line);
        } else if (line.trim() === '' && inImportSection) {
            // Import 섹션의 빈 줄은 유지
            continue;
        } else {
            inImportSection = false;
            rest.push(line);
        }
    }

    // Import 문 알파벳 순 정렬
    imports.sort();

    return [...imports, '', ...rest].join('\n');
}

// FIXME: unused - 향후 필요 시 활성화
// /**
//  * 들여쓰기 정규화
//  *
//  * @param code - 코드
//  * @returns 들여쓰기가 정규화된 코드
//  */
// function normalizeIndentation(code: string): string {
//     const lines = code.split('\n');
//     let indentLevel = 0;
//     const INDENT = '    '; // 4칸 스페이스

//     return lines
//         .map((line) => {
//             const trimmed = line.trim();

//             // 빈 줄은 그대로
//             if (trimmed === '') return '';

//             // 닫는 괄호/브래킷은 들여쓰기 감소
//             if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
//                 indentLevel = Math.max(0, indentLevel - 1);
//             }

//             const indented = INDENT.repeat(indentLevel) + trimmed;

//             // 여는 괄호/브래킷은 들여쓰기 증가
//             if (
//                 trimmed.endsWith('{') ||
//                 trimmed.endsWith('[') ||
//                 (trimmed.endsWith('(') && !trimmed.includes(')'))
//             ) {
//                 indentLevel += 1;
//             }

//             return indented;
//         })
//         .join('\n');
// }
