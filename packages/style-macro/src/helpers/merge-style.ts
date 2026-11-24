type StyleValue = Record<string, unknown>;
type StyleCallback = (...args: never[]) => StyleValue | null | undefined;
type Style = StyleValue | StyleCallback | null | undefined;

/**
 * slot CSS 변수 객체를 element 의 최종 `style` 값과 합친다. slot 이 먼저, 사용자 값이 뒤에 —
 * 사용자가 같은 key 를 주면 사용자가 이긴다.
 *
 * `style` 이 함수(Base UI 등의 stateful callback)면 호출 결과에 합치는 함수로 감싼다.
 * 객체로 펼치면 함수는 사라지므로 사용자 style 이 통째로 빠진다.
 */
export function _mergeStyle(slots: StyleValue, style: Style): Style {
    if (typeof style === 'function') {
        return (...args: never[]) => ({ ...slots, ...(style(...args) ?? {}) });
    }
    return style ? { ...slots, ...style } : slots;
}

/**
 * spread 가 있는 element 용. 속성들을 원래 순서대로 모은 props 객체에서 최종 `style` 을 읽어
 * slot 과 합친다 — 어느 속성(명시 `style`, spread)이 이겼는지는 런타임 값으로만 알 수 있다.
 */
export function _withStyle<P extends { style?: Style }>(slots: StyleValue, props: P): P {
    return { ...props, style: _mergeStyle(slots, props.style) };
}
