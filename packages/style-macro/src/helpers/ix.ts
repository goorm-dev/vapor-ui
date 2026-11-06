/**
 * 숫자-unit 결합 전용 runtime helper. 토큰 lookup 을 모른다.
 *
 * `compilers/jsx-inject.ts` 가 slot 의 axis 가 `null` (토큰 테이블이 필요
 * 없는 property) 일 때 `_resolveToken` 대신 이 함수를 참조한다. 결과적으로
 * axis-없는 slot 만 쓰는 번들은 토큰 lookup 코드 자체가 tree-shake 되어
 * 번들에 포함되지 않는다.
 *
 * - **숫자** 라면 unit 이 지정된 경우 `${n}${unit}` (보통 `'px'`) 으로,
 *   unitless property 는 `String(n)` 로.
 * - **문자열** 은 그대로 통과.
 * - **undefined / null** → `undefined`. 호출 지점에서 sentinel (`?? 'var(..., )'`)
 *   로 감싸 React 가 style attribute 자체를 제거하지 않도록 한다.
 *
 * Compiled(Atlassian) 의 `ix()` 와 역할이 같다 — 토큰 시스템 없는 번들에
 * 들어가는 가장 작은 unit helper.
 */
export function _ix(value: unknown, unit?: string): string | undefined {
    if (value == null) return undefined;
    if (typeof value === 'number') return unit ? `${value}${unit}` : String(value);
    return String(value);
}
