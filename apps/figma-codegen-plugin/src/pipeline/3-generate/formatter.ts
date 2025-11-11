/**
 * Code Formatter
 *
 * 코드 포맷팅 (Prettier 없이 기본 포맷팅)
 * Phase 2에서 Prettier 통합 예정
 */

/**
 * 코드 포맷팅
 *
 * Phase 1: 기본 포맷팅만 수행
 * Phase 2: Prettier 통합 예정
 *
 * @param code - 포맷팅할 코드
 * @returns 포맷팅된 코드
 */
export function formatCode(code: string): string {
    // Phase 1: 기본 정리만 수행
    return (
        code
            // 연속된 빈 줄을 하나로 줄임
            .replace(/\n{3,}/g, '\n\n')
            // 파일 끝에 개행 추가
            .trim() + '\n'
    );
}
