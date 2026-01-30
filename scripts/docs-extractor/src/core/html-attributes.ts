/**
 * HTML 속성 필터링 모듈
 *
 * 선언 위치 기반 필터링(declaration-source)으로 대부분의 HTML 속성이 처리되지만,
 * data-*, aria-* 속성은 선언 위치로 판단할 수 없어 이름 패턴으로 필터링합니다.
 */

export function isHtmlAttribute(name: string): boolean {
    if (name.startsWith('data-')) return true;
    if (name.startsWith('aria-')) return true;
    return false;
}
