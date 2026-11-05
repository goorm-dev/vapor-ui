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
 *
 * TODO(unit-hybrid): 지금은 **모든** 숫자 값을 runtime 에서 처리하는 단일 전략
 *   (C1). 리터럴 숫자(`css({ width: 100 })`) 도 runtime 호출이 발생한다.
 *   향후 Compiled(Atlassian) 가 쓰는 hybrid 전략으로 전환할 여지 — 리터럴은
 *   compile 시 바로 `"100px"` 리터럴로 치환하고, runtime 호출은 변수가 포함된
 *   경우에만 유지. 전환 지점:
 *     - 이 파일: 숫자 입력 handling 은 그대로 둬도 OK (리터럴이 안 들어와도
 *       호환 유지).
 *     - `compilers/jsx-inject.ts`: slot 생성 전에 `sourceExpr` 가 NumericLiteral
 *       인지 검사하고, 맞으면 `_resolveToken` 호출 대신 `'<n>px'` 리터럴 문자열을
 *       `style={{ '--...': '100px' }}` 로 직접 삽입.
 *     - `compilers/parse-call.ts`: static rule 경로에서 이미 리터럴 숫자를 CSS
 *       값으로 처리 중 → dynamic slot 쪽만 손대면 끝.
 *   도입 기준은 번들 사이즈 측정 결과 (`apps/test-app` 과 실제 소비자 번들).
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
