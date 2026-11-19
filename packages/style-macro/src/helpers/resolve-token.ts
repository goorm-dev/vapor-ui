import { findTokenRefs } from '~/models/token-ref';

type AxisTable = Readonly<Record<string, string>>;

/**
 * `$token` 참조를 CSS var 로 해석. 토큰이 아니면 값 그대로 통과.
 *
 * - **문자열** → 컴파일 타임과 같은 문법(`models/token-ref`)으로 `$token` 을 찾아 axis 테이블의
 *   `var(--vapor-…)` 로 바꾼다. 값 component 하나여야 하고, CSS 문자열·`url()` 안의 `$` 는 글자다.
 *   그래서 `'$space-100 $space-200'`, `'calc($space-100 * -1)'` 도 static 값과 같게 풀린다.
 * - 모르는 토큰·다른 글자에 붙은 토큰은 고치지 않고 그대로 둔다. 컴파일 타임이면 빌드 에러지만
 *   런타임에는 알릴 곳이 없다. `$` 를 떼어 내면 `$red` → `red` 처럼 다른 유효한 값이 되므로, 무효한
 *   CSS 로 남겨 브라우저가 선언을 버리게 한다 (devtools 에 원문이 보인다).
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
 * NOTE(unit-strategy): 리터럴 숫자는 이미 compile 시 완전 처리된다 —
 *   `parse-call.ts` 의 `extractStaticValue` 가 Literal / -Literal / expression-free
 *   TemplateLiteral 을 static 으로 판정해 atomic CSS rule 로 직접 emit 하므로
 *   이 함수는 호출조차 되지 않는다. runtime 이 실제로 담당하는 건 **변수 참조**
 *   (Identifier, CallExpression, BinaryExpression 등) 뿐.
 *
 *   즉 Vapor 는 이미 Compiled(Atlassian) 의 hybrid 전략과 같은 패턴 —
 *   리터럴=compile, 변수=runtime — 으로 동작한다.
 *
 *   향후 Compiled 스타일로 더 다듬을 지점 두 가지 (번들·UX 측면):
 *     1. 역할 분리 — 지금 이 함수는 token lookup + 숫자 unit 결합 + raw pass-through
 *        세 가지를 겸한다. Compiled 의 `ix(val, suffix)` 처럼 숫자 unit 전용 helper
 *        `_ix` 를 뽑으면 axis 테이블이 필요 없는 slot 은 훨씬 작은 함수로 참조할 수
 *        있다 (`compilers/jsx-inject.ts` 가 slot 별로 어느 helper 쓸지 결정).
 *     2. undefined sentinel — `_resolveToken(..., undefined)` 결과를 그대로 넘기면
 *        React 가 style attribute 에서 변수 자체를 제거해 부모 상속이 끊긴다.
 *        Compiled 의 `|| 'var(--slot, )'` self-reference fallback 을 jsx-inject 의
 *        slot emit 지점에서 자동 삽입하면 상속 체인을 유지할 수 있다.
 */
export function _resolveToken(axis: AxisTable, value: unknown, unit?: string): string | undefined {
    if (value == null) return undefined;
    if (typeof value === 'number') {
        return unit ? `${value}${unit}` : String(value);
    }
    if (typeof value !== 'string') return String(value);
    if (!value.includes('$')) return value;

    let out = '';
    let last = 0;
    for (const ref of findTokenRefs(value)) {
        const resolved = ref.glued ? undefined : axis[ref.name];
        if (resolved === undefined) continue;
        out += value.slice(last, ref.start) + resolved;
        last = ref.end;
    }
    return out + value.slice(last);
}
