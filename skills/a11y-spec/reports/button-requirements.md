# Button 접근성 요구사항

Button 컴포넌트가 충족해야 하는 접근성 요구사항 목록이다.

- 대상 패턴: Button (`interactive` `pointer-target` `text` `visible-label` `icon` `ui-boundary` `state-visual`)
- 항목 수: 디자인 시스템 22개 / 소비자 9개
- Base UI 구현: 지원 11 / 다른 방식 0 / 부분 2 / 미지원 9 / 슬롯 6 / 확인 불가 3

## 디자인 시스템이 보장하는 요구사항

### role

### button-role

| | |
| --- | --- |
| 요구사항 | The element that triggers the action must have role of button. |
| 근거 | Button Pattern \| APG \| WAI \| W3C |
| 이유 | Assistive technology users cannot tell an actionable control from static text without the role. |
| Base UI | 지원 — 네이티브 `<button type="button">`을 렌더해 `role` 속성 없이 역할이 성립한다 |

### state

### disabled-state-programmatic

| | |
| --- | --- |
| 요구사항 | When the button is unavailable, its disabled state must be programmatically determinable and kept in sync. |
| 근거 | WCAG 2.2 SC 4.1.2 |
| 이유 | Screen reader users would otherwise activate a control that cannot respond and get no feedback. |
| Base UI | 부분 — `focusableWhenDisabled`를 켠 조합에서만 실측했다(`aria-disabled="true"`로 전이). 기본값의 네이티브 `disabled` 전이는 미실측 |

### state-not-conveyed-by-color-alone

| | |
| --- | --- |
| 요구사항 | Button states such as pressed, selected, or disabled must not be conveyed by color alone. |
| 근거 | WCAG 2.2 SC 1.4.1 / KWCAG 5.4.1 |
| 이유 | Users who cannot perceive color differences would lose the state entirely. |
| Base UI | 미지원 — Base UI는 unstyled다. 상태의 시각 표현 전부가 vapor 몫이다 |

### structure

### structure-relationships-programmatic

| | |
| --- | --- |
| 요구사항 | Information, structure, and relationships conveyed through presentation must be programmatically determined. |
| 근거 | WCAG 2.2 SC 1.3.1 / KWCAG 5.3.1 |
| 이유 | Assistive technologies cannot infer semantics that exist only in the visual layer. |
| Base UI | 지원 — 시맨틱 요소로 렌더되어 관계 속성을 따로 얹을 필요가 없다 |

### markup-no-duplicate-ids

| | |
| --- | --- |
| 요구사항 | Generated markup must not produce duplicate ids or duplicate attributes. |
| 근거 | KWCAG 8.1.1 |
| 이유 | Duplicate ids break every relationship attribute that points at them, silently. |
| Base UI | 지원 — 데모 페이지 `id` 보유 요소 61개 중 중복 0건 |

### name-description

### accessible-name-from-content

| | |
| --- | --- |
| 요구사항 | The button's accessible name must be computed from its visible text content. |
| 근거 | WCAG 2.2 SC 4.1.2 |
| 이유 | Users need the name to know what the control does before activating it. |
| Base UI | 지원 — children 텍스트가 접근성 트리의 이름으로 계산된다 |

### focus

### focus-visible-indicator

| | |
| --- | --- |
| 요구사항 | A visible keyboard focus indicator must be present when the button has focus. |
| 근거 | WCAG 2.2 SC 2.4.7 / KWCAG 6.1.2 |
| 이유 | Keyboard users cannot tell where they are without a visible indicator. |
| Base UI | 미지원 — unstyled. `:focus-visible` 스타일은 vapor가 정의한다 |

### focus-order-follows-dom

| | |
| --- | --- |
| 요구사항 | The button must receive focus in an order that preserves meaning and operability. |
| 근거 | WCAG 2.2 SC 2.4.3 / KWCAG 6.1.2 |
| 이유 | Users navigating sequentially would otherwise encounter controls out of the order they read them. |
| Base UI | 지원 — `tabindex="0"`을 명시 부여하며 DOM 순서를 따른다 |

### focus-retained-on-activation

| | |
| --- | --- |
| 요구사항 | Activating the button must not move focus elsewhere unless the action deliberately changes context. |
| 근거 | Button Pattern \| APG \| WAI \| W3C |
| 이유 | Losing focus on activation strands keyboard users at the top of the document. |
| Base UI | 지원 — Enter·Space 활성화 후에도 포커스가 버튼에 남는다 |

### focus-not-lost-when-disabled

| | |
| --- | --- |
| 요구사항 | When the button becomes disabled while focused, focus must not be lost from the document. |
| 근거 | WCAG 2.2 SC 2.4.3 |
| 이유 | A loading button that drops focus sends the user back to the document start mid-task. |
| Base UI | 부분 — `focusableWhenDisabled`를 켠 조합에서만 포커스와 `tabindex="0"`이 유지된다. 기본값에서는 유지되지 않을 것으로 보이나 미실측 |

### no-context-change-on-focus

| | |
| --- | --- |
| 요구사항 | Receiving focus must not initiate a change of context. |
| 근거 | WCAG 2.2 SC 3.2.1 / KWCAG 7.2.1 |
| 이유 | Users tabbing through a page would trigger actions they never chose. |
| Base UI | 지원 — 포커스만으로 이벤트도 DOM 변이도 발생하지 않는다 |

### keyboard

### keyboard-enter-activates

| | |
| --- | --- |
| 요구사항 | The Enter key must activate the button. |
| 근거 | Button Pattern \| APG \| WAI \| W3C |
| 이유 | Enter is the expected activation key; without it keyboard users cannot reach the action. |
| Base UI | 지원 — 실측에서 키보드 `click`(`detail: 0`)이 1회 발화 |

### keyboard-space-activates

| | |
| --- | --- |
| 요구사항 | The Space key must activate the button. |
| 근거 | Button Pattern \| APG \| WAI \| W3C |
| 이유 | Space is the expected activation key for buttons; screen reader users rely on it. |
| Base UI | 지원 — 실측에서 키보드 `click`(`detail: 0`)이 1회 발화 |

### all-functionality-keyboard-operable

| | |
| --- | --- |
| 요구사항 | All functionality must be operable through a keyboard interface without requiring specific timings. |
| 근거 | WCAG 2.2 SC 2.1.1 / KWCAG 6.1.1 |
| 이유 | People who cannot use a pointing device would lose the action entirely. |
| Base UI | 지원 — 네이티브 활성화 경로 외에 포인터 전용 기능이 없다 |

### contrast

### non-text-contrast-minimum

| | |
| --- | --- |
| 요구사항 | The button's border, focus indicator, and state indicators must have a contrast ratio of at least 3:1 against adjacent colors. |
| 근거 | WCAG 2.2 SC 1.4.11 / KWCAG 5.4.4 |
| 이유 | Users with low vision cannot locate the control or its focus ring below that ratio. |
| Base UI | 미지원 — unstyled. 데모 측정값 19.8:1은 데모 CSS의 값이며 위임 근거가 아니다 |

### visual-boundary-distinguishable

| | |
| --- | --- |
| 요구사항 | The button must be visually distinguishable from adjacent content. |
| 근거 | KWCAG 5.4.4 |
| 이유 | Without a boundary users cannot tell the control apart from surrounding text. |
| Base UI | 미지원 — unstyled. 테두리 없는 ghost 계열 variant는 vapor가 대체 신호를 정해야 한다 |

### presentation

### text-resize-no-clipping

| | |
| --- | --- |
| 요구사항 | Text must remain fully visible when resized up to 200 percent. |
| 근거 | WCAG 2.2 SC 1.4.4 |
| 이유 | Users who enlarge text would lose the label to clipping. |
| Base UI | 미지원 — unstyled. 고정 px 높이를 두면 즉시 깨지는 축이다 |

### text-spacing-no-clipping

| | |
| --- | --- |
| 요구사항 | No content must be lost when line height is set to 1.5 times the font size and letter spacing to 0.12 em. |
| 근거 | WCAG 2.2 SC 1.4.12 |
| 이유 | Users who override spacing for readability would lose part of the label. |
| Base UI | 미지원 — unstyled. 데모에서는 잘림이 없었으나 그 값은 데모 CSS의 결과다 |

### reflow-320px

| | |
| --- | --- |
| 요구사항 | Content must be usable at a 320 CSS pixel viewport width without two-dimensional scrolling. |
| 근거 | WCAG 2.2 SC 1.4.10 |
| 이유 | Users who zoom on a small screen would have to scroll both axes to read one label. |
| Base UI | 미지원 — unstyled. 폭 제약은 vapor의 스타일이 결정한다 |

### orientation-not-restricted

| | |
| --- | --- |
| 요구사항 | The button must not restrict its presentation to a single display orientation. |
| 근거 | WCAG 2.2 SC 1.3.4 |
| 이유 | Users who cannot rotate their device would be locked out of the control. |
| Base UI | 미지원 — unstyled. 폭·줄바꿈이 방향에 묶이지 않게 하는 것은 vapor 몫이다 |

### target

### target-size-minimum

| | |
| --- | --- |
| 요구사항 | The button must be at least 24 by 24 CSS pixels unless the spacing exception applies. |
| 근거 | WCAG 2.2 SC 2.5.8 |
| 이유 | People with limited fine motor control would miss the target or hit a neighbor. |
| Base UI | 미지원 — unstyled. 데모의 72×32는 레이블 길이가 만든 폭이므로 아이콘 전용에서는 근거가 되지 않는다 |

### pointer-cancellation

| | |
| --- | --- |
| 요구사항 | The action must execute on the up-event, and moving the pointer off the button before release must cancel it. |
| 근거 | WCAG 2.2 SC 2.5.2 / KWCAG 6.5.2 |
| 이유 | Users with tremor or imprecise pointing need a way to abort an accidental press. |
| Base UI | 지원 — 버튼 밖에서 릴리스했을 때 `pointerdown`·`mousedown`만 발화하고 `click`은 발화하지 않았다 |

## 소비자가 충족해야 하는 요구사항

### name-description

### accessible-name-required-for-icon-only

| | |
| --- | --- |
| 요구사항 | A button whose content is an icon only must be given an accessible name through aria-label or aria-labelledby. |
| 근거 | WCAG 2.2 SC 1.1.1 / KWCAG 5.1.1 |
| 이유 | Without a name the control is announced as an unlabeled button and its purpose is unknowable. |
| Base UI | 슬롯 제공 — `aria-label`·`aria-labelledby`가 패스스루된다. 아이콘 children을 `aria-hidden`으로 두는 규약은 vapor가 정한다 |

### label-in-name

| | |
| --- | --- |
| 요구사항 | When both visible text and aria-label are present, the accessible name must contain the visible text. |
| 근거 | WCAG 2.2 SC 2.5.3 / KWCAG 6.5.3 |
| 이유 | Speech input users say what they see; a name that omits the visible text makes the control unreachable by voice. |
| Base UI | 슬롯 제공 — `aria-label`이 children 텍스트를 덮어쓰는 것을 상류가 막지 않는다 |

### label-describes-action

| | |
| --- | --- |
| 요구사항 | The button label must describe the action it performs. |
| 근거 | WCAG 2.2 SC 2.4.6 / KWCAG 6.4.2 |
| 이유 | Users deciding whether to activate need the outcome in the label, not a generic word. |
| Base UI | 슬롯 제공 — children이 레이블 슬롯이다 |

### consistent-identification

| | |
| --- | --- |
| 요구사항 | Buttons with the same function must be identified consistently across the product. |
| 근거 | WCAG 2.2 SC 3.2.4 |
| 이유 | Inconsistent labels and icons force users to relearn the same control on every screen. |
| Base UI | DOM 확인 불가 — 제품 전반의 일관성은 단일 DOM으로 판정할 수 없다 |

### contrast

### text-contrast-minimum

| | |
| --- | --- |
| 요구사항 | Button label text must have a contrast ratio of at least 4.5:1, or 3:1 for large text. |
| 근거 | WCAG 2.2 SC 1.4.3 / KWCAG 5.4.3 |
| 이유 | Users with moderately low vision cannot read the label below that ratio. |
| Base UI | DOM 확인 불가 — 기본 토큰 짝은 vapor가 보장하지만 `className`으로 덮어쓴 색은 사용처에서만 판정된다 |

### presentation

### no-text-in-images

| | |
| --- | --- |
| 요구사항 | Images of text must not be used to render the button label. |
| 근거 | WCAG 2.2 SC 1.4.5 |
| 이유 | Text baked into an image cannot be resized, recolored, or read by assistive technology. |
| Base UI | 슬롯 제공 — 아이콘 자리에 무엇이 들어오는지는 사용처가 결정한다 |

### label-language

| | |
| --- | --- |
| 요구사항 | When the label language differs from the page language, it must be marked with a lang attribute. |
| 근거 | WCAG 2.2 SC 3.1.2 |
| 이유 | Screen readers would pronounce the label with the wrong voice and become unintelligible. |
| Base UI | 슬롯 제공 — `lang` 속성이 패스스루된다 |

### orientation-layout

| | |
| --- | --- |
| 요구사항 | Layouts placing the button must not require a single display orientation. |
| 근거 | WCAG 2.2 SC 1.3.4 |
| 이유 | Users with a fixed-mount device cannot rotate to satisfy the layout. |
| Base UI | 슬롯 제공 — 버튼을 감싸는 레이아웃은 사용처가 소유한다 |

### no-sensory-only-instructions

| | |
| --- | --- |
| 요구사항 | Instructions must not rely solely on shape, color, size, or visual location to identify the button. |
| 근거 | WCAG 2.2 SC 1.3.3 / KWCAG 5.3.3 |
| 이유 | Users who cannot perceive the sensory cue cannot find the control the instruction refers to. |
| Base UI | DOM 확인 불가 — 안내 문구는 컴포넌트 밖에 있다 |

## 출처

- [https://www.w3.org/WAI/ARIA/apg/patterns/button/](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role)
- [https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/reflow.html](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html](https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html)
- [https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)
