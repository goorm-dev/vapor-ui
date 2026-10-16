---
version: 1
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
- 줄바꿈, 목록 기호, 마크다운 링크의 URL

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
