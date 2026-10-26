# ADR-0002: 문서 사이트 컴포넌트 카탈로그를 8개 범주로 재편합니다

- **상태**: Proposed
- **날짜**: 2026-10-25

## Context

문서 사이트의 컴포넌트 카탈로그(`components/index.mdx`, `composites/index.mdx`)는 각 컴포넌트 카드에 `componentType` 라벨을 붙여 범주를 표현합니다. 기존 카탈로그는 7개 범주(Buttons, Data Display, Feedback, Inputs, Navigation, Overlay, Typography)를 사용했지만 아래 네 가지 분류가 업계에서 통용되는 taxonomy(Radix, MUI, Chakra, Ant, Adobe Spectrum)와 어긋나 있었습니다.

- `Dialog`가 Feedback에 들어가 있음. Dialog는 사용자 흐름을 중단시키는 모달이므로 Overlay 영역입니다. Feedback은 Toast·Callout·Spinner 같은 수동 알림이 들어가는 자리입니다.
- `Menu`가 Navigation에 들어가 있음. Menu(드롭다운)는 액션 트리거이자 레이어 위에 뜨는 UI입니다. Breadcrumb·NavigationMenu·Pagination과 결이 다릅니다.
- `Collapsible`이 Data Display에 들어가 있음. Collapsible은 WAI-ARIA Disclosure 패턴이며 Avatar·Badge·Table 같은 정적 표현과 성격이 다릅니다.
- `Tabs`가 Navigation에 들어가 있음. Vapor의 Tabs 구현은 ARIA tablist 기반 패널 스위칭이므로 Disclosure 쪽에 가깝습니다.

또한 범주명 두 개가 좁았습니다. `Buttons`는 "액션 트리거"라는 더 넓은 역할을 포괄하지 못하고, `Inputs`는 실제 입력 요소 외에도 `Field`·`InputGroup` 같은 폼 wrapper를 함께 담고 있어 명칭이 실제 범위와 어긋났습니다.

신규 컴포넌트가 추가될 때마다 "이건 어느 범주에 넣어야 하지?"가 반복해서 리뷰에 올라오고 있어 분류 기준을 코드 리뷰에서 링크할 수 있는 문서로 남길 필요가 생겼습니다.

## Decision

### 분류 축 원칙

하나의 컴포넌트가 Form(형태)과 Purpose(목적) 두 축에서 모두 유효할 때는 다음 규칙으로 축을 선택합니다.

- **Form(형태)을 축으로 사용**: 상황에 따라 사용자가 **목적 자체를 바꿀 수 있는** 컴포넌트. 사용자가 담는 콘텐츠에 따라 액션 트리거일 수도, 네비게이션일 수도, 정보 전달일 수도 있는 surface primitive에 적용합니다.
- **Purpose(목적)를 축으로 사용**: 목적이 **항상 일관**되고 사용자는 그 안의 **정보 종류만** 바꿀 수 있는 컴포넌트. 역할이 고정된 컴포넌트에 적용합니다.

예시:

| 컴포넌트                | 사용자가 목적을 바꿀 수 있는가    | 축      | 범주     |
| ----------------------- | --------------------------------- | ------- | -------- |
| Dialog                  | O (폼·확인·정보 안내 등)          | Form    | Overlay  |
| Popover, Sheet, Tooltip | O                                 | Form    | Overlay  |
| Menu                    | O (액션 목록·네비 링크·필터 옵션) | Form    | Overlay  |
| FloatingBar             | O                                 | Form    | Overlay  |
| Toast                   | X (일시 알림 전용)                | Purpose | Feedback |
| Callout                 | X (상태 메시지 전용)              | Purpose | Feedback |
| Spinner                 | X (로딩 상태 전용)                | Purpose | Feedback |
| Button, IconButton      | X (액션 트리거 고정)              | Purpose | Actions  |

### 범주 정의

문서 사이트 카탈로그의 범주를 다음 8개로 정의하고, 각 범주의 포함 기준을 아래와 같이 둡니다.

| 범주         | 포함 기준                                               | 현재 소속                                                                                                                     |
| ------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Actions      | 사용자 명령을 트리거하는 요소                           | Button, IconButton                                                                                                            |
| Forms        | 사용자 입력을 수집하거나 입력 요소를 그룹화하는 wrapper | Checkbox, Field, InputGroup, MultiSelect, Radio, RadioCard, RadioGroup, Select, SegmentedControl, Switch, TextInput, Textarea |
| Data Display | 정적 데이터를 표현하는 요소                             | Avatar, Badge, Card, Table                                                                                                    |
| Typography   | 텍스트 요소                                             | Text                                                                                                                          |
| Navigation   | 라우트·위치 간 이동 수단                                | Breadcrumb, NavigationMenu, Pagination                                                                                        |
| Disclosure   | 콘텐츠를 접고 펼치거나 패널을 전환하는 요소             | Collapsible, Tabs                                                                                                             |
| Overlay      | 레이어 위에 뜨는 UI(모달·플로팅·팝업 포함)              | Dialog, FloatingBar, Menu, Popover, Sheet, Tooltip                                                                            |
| Feedback     | 수동적으로 상태나 알림을 전달하는 요소                  | Callout, Spinner, Toast                                                                                                       |

`components/index.mdx`와 `composites/index.mdx`는 이 범주별로 `## <Category>` 섹션을 두고 각 섹션 안에 `<AllComponentsContainer>` grid를 둡니다. 각 카드는 `componentType` prop으로 범주를 재강조합니다.

이 ADR 이후 신규 컴포넌트를 카탈로그에 추가할 때는 위 포함 기준에 따라 범주를 선택하고, 애매한 경우에는 이 ADR을 링크한 PR에서 논의해 결정합니다.

## Consequences

- 신규 컴포넌트 PR에서 범주 선정의 근거를 이 ADR로 링크할 수 있습니다. 리뷰에서 같은 논의가 반복되지 않습니다.
- 업계 taxonomy와 정렬되어 외부 기여자가 Vapor 카탈로그를 처음 볼 때 멘탈 모델이 맞습니다.
- Disclosure 범주가 새로 생기므로 신규 상호작용 컴포넌트가 Navigation인지 Disclosure인지 매번 판단해야 합니다. 판단 기준은 "라우트가 바뀌면 Navigation, 같은 페이지 안에서 콘텐츠만 전환되면 Disclosure"입니다.
- `FloatingBar`를 Overlay에 두었지만 persistent chrome 성격이 있어 "Layout" 범주를 신설할지 여부는 미해결로 남깁니다. 향후 Layout 성격 컴포넌트가 2개 이상 생기면 별도 ADR에서 재검토합니다.
- 기존 `componentType` 라벨 문자열이 바뀌므로 라벨을 하드코딩해 필터링하거나 스타일링하는 코드가 있다면 함께 업데이트해야 합니다. 현재 `ComponentsCard`는 라벨을 Badge 텍스트로만 사용하므로 영향 없습니다.
