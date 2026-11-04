type AxisTable = Readonly<Record<string, string>>;

/**
 * `$` 접두 토큰 참조를 CSS var 로 해석. 토큰이 아니면 값 그대로 통과.
 *
 * - **문자열** 이면서 `$` 로 시작 → axis 테이블에서 조회해 `var(--vapor-…)` 로 치환.
 * - **문자열** 이지만 `$` 가 아님 → 사용자가 완전한 CSS 값을 넘긴 것으로 간주, 그대로.
 * - **숫자** 라면 unit 이 지정된 property 는 `${n}${unit}` (기본 `px`) 로,
 *   unitless property 는 그대로 숫자 → 문자열로. 리뷰 #5c (동적 숫자 값에
 *   단위 미부여) 를 compile/runtime 의 역할 분담으로 해결 — 컴파일러가
 *   property 의 unitless 여부를 결정해 `unit` 인자를 미리 꽂아 넘긴다.
 *
 * 컴파일러가 property 로부터 axis 를 미리 결정해 두고,
 * 해당 axis 테이블(`@vapor-ui/style-macro/__runtime__/tokens` 에서 import)
 * 을 첫 인자로 넘긴다. 런타임에 property → axis 룩업이 사라지고,
 * 사용 안 하는 axis 테이블은 bundler 가 제거 가능.
 */
export function _resolveToken(
    axis: AxisTable,
    value: unknown,
    unit?: string,
): string | number | null | undefined {
    if (typeof value === 'number') {
        return unit ? `${value}${unit}` : String(value);
    }
    if (typeof value !== 'string') return value as string | null | undefined;
    if (!value.startsWith('$')) return value;

    const key = value.slice(1);
    const resolved = axis[key];
    return resolved !== undefined ? resolved : key;
}
