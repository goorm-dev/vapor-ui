/**
 * 주어진 순서에 따라 테마 데이터를 정렬하는 유틸리티 함수
 *
 * @param themeData - 정렬할 테마 데이터 객체
 * @param order - 원하는 테마 순서 배열
 * @returns 순서대로 정렬된 [테마키, 테마데이터] 튜플 배열
 *
 * @example
 * const palette = { light: {...}, dark: {...}, base: {...} };
 * const sorted = sortThemesByOrder(palette, ['base', 'light', 'dark']);
 * // 결과: [['base', {...}], ['light', {...}], ['dark', {...}]]
 */
export function sortThemesByOrder<T extends Partial<Record<K, unknown>>, K extends string>(
    themeData: T,
    order: readonly K[],
): Array<readonly [K, NonNullable<T[K]>]> {
    return order
        .filter((theme): theme is K => theme in themeData && themeData[theme] != null)
        .map((theme) => [theme, themeData[theme]!] as const);
}
