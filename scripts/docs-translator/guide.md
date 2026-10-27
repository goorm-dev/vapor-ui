---
version: 2
model: claude-sonnet-5-5
---

# API 문서 번역 가이드

`@vapor-ui/core` 컴포넌트와 prop의 영어 설명(원문)을 문서 사이트 props 표에 들어갈 한국어 번역으로 옮기는 규칙이다.
독자는 React로 화면을 만드는 개발자다. props 표를 훑어보며 prop 하나의 뜻을 빠르게 확인하려고 읽는다.

번역 결과를 바꿔야 하는 수정이면 `version`을 올린다. 오탈자나 설명 보강처럼 결과가 달라지지 않는 수정이면 그대로 둔다.

## 1. 그대로 두는 것

다음은 한 글자도 바꾸지 않는다. 번역문에서도 원문과 똑같은 문자열이어야 한다.

- 백틱으로 감싼 모든 것: `` `open` ``, `` `<div>` ``, `` `Dialog.PopupPrimitive` ``, `` `'trap-focus'` ``
- 따옴표로 감싼 값: `'true'`, `"unmount"`
- 컴포넌트 이름: Dialog, Select, Popover, Tooltip, Menu 등. 원문에서 소문자로 써도 그 컴포넌트를 가리키면 PascalCase로 쓴다 (`the dialog` → Dialog)
- 기술·언어·표준 이름: React, CSS, HTML, ARIA, JavaScript, `Intl.NumberFormat`
- 빈 줄(문단 구분), 목록 기호, 마크다운 링크의 URL
- 원문 문장 중간의 단순 줄바꿈은 원문 줄 길이에 맞춘 것이다. 번역에서는 이어 쓴다.
- 원문에 없는 백틱을 만들지 않는다. 원문에서 백틱 없이 쓴 단어(`null item`의 null 등)는 번역에서도 백틱 없이 쓴다.

> ❌ `'trap 포커스'`: 포커스는 Dialog 안에 갇히지만…
> ✅ `'trap-focus'`: 포커스는 Dialog 안에 갇히지만…

## 2. 문체

- 문장은 합니다체로 끝낸다. 십시오체와 해요체는 쓰지 않는다.
- 독자에게 무언가를 권할 때는 "~하세요"를 쓴다.
- **원문의 구조를 따른다.** 원문이 명사구면 명사구로, 문장이면 문장으로 옮긴다. 마침표도 원문을 따른다.

> `Size of the meter, controlling the height of the track.`
> → 미터의 크기. 트랙의 높이를 결정합니다.
>
> `The current value.`
> → 현재 값.
>
> `Current text in the field. Use when controlled.`
> → 필드의 현재 텍스트. 제어 컴포넌트로 쓸 때 사용하세요.

## 3. 자주 나오는 원문 패턴

원문에서 반복되는 틀은 아래 형태로 고정한다. 같은 틀을 매번 다르게 옮기지 않는다.

| 원문                                           | 번역                                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| Renders a `<div>` element.                     | `<div>` 요소로 렌더링됩니다.                                            |
| Doesn't render its own HTML element.           | 자체 HTML 요소를 렌더링하지 않습니다.                                   |
| Whether the … / Whether to …                   | …하는지 여부. / …할지 여부.                                             |
| Event handler called when …                    | …할 때 호출되는 이벤트 핸들러.                                          |
| Callback fired when … / Called when …          | …할 때 호출되는 콜백. / …할 때 호출됩니다.                              |
| Replaces the default …                         | 기본 …을(를) 대체합니다.                                                |
| Combines `A`, `B`, and `C` into a single part. | `A`, `B`, `C`를 하나의 파트로 합칩니다.                                 |
| Root of the …                                  | …의 루트.                                                               |
| Size of the …                                  | …의 크기.                                                               |
| Use when controlled. / Use when uncontrolled.  | 제어 컴포넌트로 쓸 때 사용하세요. / 비제어 컴포넌트로 쓸 때 사용하세요. |
| A handle to associate the trigger with a …     | 트리거를 …와(과) 연결하는 핸들.                                         |

## 4. 자연스러운 한국어

- 능동형으로 쓴다. 이중피동("보여지다", "되어지다")은 쓰지 않는다.
- 빼도 뜻이 통하는 한자어 동사를 쓰지 않는다: 수행합니다, 진행합니다, 제공합니다.
- "~를 통해"는 "~로"로 쓴다.
- you, your, it 같은 대명사는 옮기지 않는다. "당신", "여러분"도 쓰지 않는다.
- 복수형 "-들"은 뜻이 달라질 때만 붙인다.
- 원문에 없는 정보, 예시, 주의 문구를 덧붙이지 않는다. 원문의 정보를 빼지도 않는다.
- 외래어는 국립국어원 표기를 따르되 업계에서 굳은 표기를 우선한다: 콘텐츠, 메시지.
- 이모지와 문장 끝 쌍점을 쓰지 않는다.

> ❌ 이 prop을 통해 팝업이 보여지는 위치를 지정하는 기능을 제공합니다.
> ✅ 팝업을 표시할 위치를 지정합니다.

## 5. 용어

`glossary.json`에 있는 용어는 반드시 그 번역을 쓴다.
용어집에 없는 용어도 한 번역 안에서는 하나의 표현으로만 쓴다.

## 6. 여러 컴포넌트에 반복되는 문장

같은 원문은 페이지가 달라도 같은 번역이어야 한다. 아래 원문은 표의 번역을 글자 그대로 쓴다.

| 원문                                                                                                                                                                                              | 번역                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSS class applied to the element, or a function that returns a class based on the component’s state.                                                                                              | 요소에 적용되는 CSS 클래스 또는 컴포넌트의 상태에 따라 클래스를 반환하는 함수.                                                                        |
| Style applied to the element, or a function that returns a style object based on the component’s state.                                                                                           | 요소에 적용되는 스타일 또는 컴포넌트의 상태에 따라 스타일 객체를 반환하는 함수.                                                                       |
| Allows you to replace the component's HTML element with a different tag, or compose it with another component. (빈 줄) Accepts a `ReactElement` or a function that returns the element to render. | 컴포넌트의 HTML 요소를 다른 태그로 바꾸거나 다른 컴포넌트와 합성할 수 있습니다. (빈 줄) `ReactElement` 또는 렌더링할 요소를 반환하는 함수를 받습니다. |
| Whether the component should ignore user interaction.                                                                                                                                             | 컴포넌트가 사용자 상호작용을 무시할지 여부.                                                                                                           |
| Whether the component renders a native `<button>` element when replacing it via the `render` prop.                                                                                                | `render` prop으로 요소를 바꿀 때 컴포넌트가 네이티브 `<button>` 요소를 렌더링하는지 여부.                                                             |
| Set to `false` if the rendered element is not a button (for example, `<div>`).                                                                                                                    | 렌더링되는 요소가 버튼이 아니면(예: `<div>`) `false`로 설정하세요.                                                                                    |
| Set to `true` if the rendered element is a native button.                                                                                                                                         | 렌더링되는 요소가 네이티브 버튼이면 `true`로 설정하세요.                                                                                              |
| A parent element to render the portal element into.                                                                                                                                               | 포털 요소를 렌더링할 부모 요소.                                                                                                                       |
| A ref to access the hidden input element.                                                                                                                                                         | 숨겨진 input 요소에 접근하는 ref.                                                                                                                     |
| Whether the user must choose a value before submitting a form.                                                                                                                                    | 폼을 제출하기 전에 사용자가 값을 반드시 선택해야 하는지 여부.                                                                                         |
| Identifies the field when a form is submitted.                                                                                                                                                    | 폼을 제출할 때 필드를 식별하는 이름.                                                                                                                  |
| Whether to keep the portal mounted in the DOM while the popup is hidden.                                                                                                                          | 팝업이 숨겨져 있는 동안에도 포털을 DOM에 마운트해 둘지 여부.                                                                                          |
| An element to position the popup against. By default, the popup will be positioned against the trigger.                                                                                           | 팝업을 배치할 기준 요소. 기본값은 트리거입니다.                                                                                                       |
| How to align the popup relative to the specified side.                                                                                                                                            | 지정한 방향을 기준으로 팝업을 정렬하는 방식.                                                                                                          |
| Which side of the anchor element to align the popup against. May automatically change to avoid collisions.                                                                                        | 팝업을 정렬할 앵커 요소의 방향. 충돌을 피하려고 자동으로 바뀔 수 있습니다.                                                                            |
| An element or a rectangle that delimits the area that the popup is confined to.                                                                                                                   | 팝업이 벗어나지 못하는 영역을 정하는 요소 또는 사각형.                                                                                                |
| Additional space to maintain from the edge of the collision boundary.                                                                                                                             | 충돌 경계의 가장자리에서 유지할 추가 여백.                                                                                                            |
| Whether to disable the popup from tracking any layout shift of its positioning anchor.                                                                                                            | 팝업이 기준 앵커의 레이아웃 이동을 따라가지 않게 할지 여부.                                                                                           |
| Determines which CSS `position` property to use.                                                                                                                                                  | 사용할 CSS `position` 속성.                                                                                                                           |
| Whether to maintain the popup in the viewport after the anchor element was scrolled out of view.                                                                                                  | 앵커 요소가 스크롤되어 화면 밖으로 나간 뒤에도 팝업을 뷰포트 안에 유지할지 여부.                                                                      |
| Minimum distance to maintain between the arrow and the edges of the popup.                                                                                                                        | 화살표와 팝업 가장자리 사이에 유지할 최소 거리.                                                                                                       |
| Use it to prevent the arrow element from hanging out of the rounded corners of a popup.                                                                                                           | 화살표 요소가 팝업의 둥근 모서리 밖으로 튀어나오지 않게 할 때 사용하세요.                                                                             |
| Distance between the anchor and the popup in pixels.                                                                                                                                              | 앵커와 팝업 사이의 거리(픽셀).                                                                                                                        |
| Additional offset along the alignment axis in pixels.                                                                                                                                             | 정렬 축 방향의 추가 오프셋(픽셀).                                                                                                                     |
| Also accepts a function that returns the distance to read the dimensions of the anchor and positioner elements, along with its side and alignment.                                                | 앵커 요소와 포지셔너 요소의 크기, 방향, 정렬을 읽어 거리를 반환하는 함수도 받습니다.                                                                  |
| The function takes a `data` object parameter with the following properties:                                                                                                                       | 함수는 다음 속성을 가진 `data` 객체를 인수로 받습니다.                                                                                                |
| Determines how to handle collisions when positioning the popup.                                                                                                                                   | 팝업을 배치할 때 충돌을 처리하는 방식.                                                                                                                |
| Whether to loop keyboard focus back to the first item when the end of the list is reached while using the arrow keys.                                                                             | 화살표 키로 목록 끝에 도달했을 때 키보드 포커스를 첫 항목으로 되돌릴지 여부.                                                                          |
| Whether moving the pointer over items should highlight them.                                                                                                                                      | 포인터를 항목 위로 옮기면 항목을 강조할지 여부.                                                                                                       |
| Provides a hint to the browser for autofill.                                                                                                                                                      | 브라우저 자동 완성에 쓰이는 힌트.                                                                                                                     |

표에 없는 반복 문장도 같은 틀이면 같은 단어를 쓴다.

- 포커스 대상 prop(`initialFocus`, `finalFocus`)
    - Determines the element to focus when the … is opened/closed. → …가 열릴/닫힐 때 포커스할 요소.
    - `false`: Do not move focus. → `false`: 포커스를 옮기지 않습니다.
    - `true`: Move focus based on the default behavior (…). → `true`: 기본 동작(…)에 따라 포커스를 옮깁니다.
    - `RefObject`: Move focus to the ref element. → `RefObject`: ref가 가리키는 요소로 포커스를 옮깁니다.
    - "move focus"는 항상 "포커스를 옮기다"로 쓴다. "이동하다"와 섞어 쓰지 않는다.
- Whether the … is initially open. → …가 처음에 열려 있는지 여부.
- To render a controlled …, use the `open` prop instead. → 제어 컴포넌트로 렌더링하려면 대신 `open` prop을 사용하세요.
- Event handler called after any animations complete when the … is opened or closed. → …가 열리거나 닫힌 뒤 애니메이션이 모두 끝나면 호출되는 이벤트 핸들러.
- Determines if the … enters a modal state when open. → …가 열렸을 때 모달 상태가 되는지 여부.
