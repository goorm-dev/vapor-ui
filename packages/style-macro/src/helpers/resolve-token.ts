type AxisTable = Readonly<Record<string, string>>;

/**
 * `$` 접두 토큰 참조를 CSS var 로 해석. 토큰이 아니면 값 그대로 통과.
 *
 * 컴파일러가 property 로부터 axis 를 미리 결정해 두고,
 * 해당 axis 테이블(`@vapor-ui/style-macro/__runtime__/tokens` 에서 import)
 * 을 첫 인자로 넘긴다. 런타임에 property → axis 룩업이 사라지고,
 * 사용 안 하는 axis 테이블은 bundler 가 제거 가능.
 */
export function _resolveToken(axis: AxisTable, value: unknown) {
    if (typeof value !== 'string') return value;
    if (!value.startsWith('$')) return value;

    const key = value.slice(1);
    const resolved = axis[key];
    return resolved !== undefined ? resolved : key;
}
