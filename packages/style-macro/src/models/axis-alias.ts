/**
 * 사용자 스코프 바인딩과 충돌하지 않도록 axis import 에 쓰는 고유 prefix.
 * `color`, `space` 같은 흔한 이름을 bare 로 import 하면 소비자 코드의
 * 지역 변수에 가려지거나 (`const color = …` → `_resolveToken(color, color)` 가
 * axis 테이블 대신 지역변수를 넘겨 토큰 룩업이 깨짐) 모듈 최상위 중복
 * 선언으로 SyntaxError 를 낸다. prefix 로 충돌을 원천 차단.
 */
const AXIS_ALIAS_PREFIX = '__vaporAxis_';

export function axisAliasName(axis: string): string {
    return `${AXIS_ALIAS_PREFIX}${axis}`;
}
