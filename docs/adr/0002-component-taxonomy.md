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

### 분류 우선순위

범주는 아래 두 단계로 정합니다.

1. **기본은 용도로 분류합니다.** 컴포넌트의 역할(액션 트리거·입력 수집·네비게이션·알림 등)이 하나로 정해져 있으면 그 역할에 맞는 범주에 넣습니다. 예: Button은 "액션 트리거"로 고정이므로 Actions, Toast는 "일시 알림"으로 고정이므로 Feedback.

2. **용도가 콘텐츠에 따라 달라져 하나로 정할 수 없으면 생김새로 분류합니다.** Dialog·Menu·Popover 같은 컴포넌트는 담기는 콘텐츠에 따라 액션 확인창일 수도, 네비게이션 메뉴일 수도, 정보 안내일 수도 있어서 용도만으로 범주를 고를 수 없습니다. 이때는 공통된 생김새인 "레이어 위에 뜬다"를 기준으로 **Overlay** 범주에 넣습니다.

예시:

| 컴포넌트                | 용도가 하나로 정해지는가          | 적용 단계      | 범주     |
| ----------------------- | --------------------------------- | -------------- | -------- |
| Button, IconButton      | O (액션 트리거)                   | 1단계 (용도)   | Actions  |
| Toast                   | O (일시 알림)                     | 1단계 (용도)   | Feedback |
| Callout                 | O (상태 메시지)                   | 1단계 (용도)   | Feedback |
| Spinner                 | O (로딩 상태)                     | 1단계 (용도)   | Feedback |
| Dialog                  | X (폼·확인·정보 안내 등)          | 2단계 (생김새) | Overlay  |
| Menu                    | X (액션 목록·네비 링크·필터 옵션) | 2단계 (생김새) | Overlay  |
| Popover, Sheet          | X                                 | 2단계 (생김새) | Overlay  |
| Tooltip                 | X (설명·단축키·힌트·상태 안내 등) | 2단계 (생김새) | Overlay  |
| FloatingBar             | X                                 | 2단계 (생김새) | Overlay  |

### 범주 정의

문서 사이트 카탈로그의 범주를 다음 8개로 정의하고, 각 범주의 포함 기준을 아래와 같이 둡니다.

| 범주         | 포함 기준                                               | 현재 소속                                                                                                                     |
| ------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Actions      | 사용자 명령을 트리거하는 요소                           | Button, IconButton                                                                                                            |
| Forms        | 사용자 입력을 수집하거나 입력 요소를 그룹화하는 wrapper | Checkbox, Field, InputGroup, MultiSelect, Radio, RadioCard, RadioGroup, Select, SegmentedControl, Switch, TextInput, Textarea |
| Data Display | 정적 데이터를 표현하는 요소                             | Avatar, Badge, Card, Table                                                                                                    |
| Typography   | 텍스트 요소                                             | Text                                                                                                                          |
| Navigation   | 라우트·위치 간 이동 수단                                | Breadcrumb, NavigationMenu, Pagination                                                                                        |
| Disclosure   | 같은 페이지 내에서 콘텐츠 영역을 접고 펼치거나 패널을 전환하는 요소 (WAI-ARIA의 Disclosure 패턴과는 별개의 Vapor 카탈로그 범주) | Collapsible, Tabs                                                                                                             |
| Overlay      | 레이어 위에 뜨는 UI(모달·플로팅·팝업 포함)              | Alert Dialog, Dialog, FloatingBar, Menu, Popover, Sheet, Tooltip                                                              |
| Feedback     | 수동적으로 상태나 알림을 전달하는 요소                  | Callout, Spinner, Toast                                                                                                       |

`components/index.mdx`와 `composites/index.mdx`는 이 범주별로 `## <Category>` 섹션을 두고 각 섹션 안에 `<AllComponentsContainer>` grid를 둡니다. 각 카드는 `componentType` prop으로 범주를 재강조합니다.

이 ADR 이후 신규 컴포넌트를 카탈로그에 추가할 때는 위 포함 기준에 따라 범주를 선택하고, 애매한 경우에는 이 ADR을 링크한 PR에서 논의해 결정합니다.

## Consequences

- 신규 컴포넌트 PR에서 범주 선정의 근거를 이 ADR로 링크할 수 있습니다. 리뷰에서 같은 논의가 반복되지 않습니다.
- 업계 taxonomy와 정렬되어 외부 기여자가 Vapor 카탈로그를 처음 볼 때 멘탈 모델이 맞습니다.
- Disclosure 범주가 새로 생기므로 신규 상호작용 컴포넌트가 Navigation인지 Disclosure인지 매번 판단해야 합니다. 판단 기준은 "라우트가 바뀌면 Navigation, 같은 페이지 안에서 콘텐츠만 전환되면 Disclosure"입니다.
- `FloatingBar`를 Overlay에 두었지만 persistent chrome 성격이 있어 "Layout" 범주를 신설할지 여부는 미해결로 남깁니다. 향후 Layout 성격 컴포넌트가 2개 이상 생기면 별도 ADR에서 재검토합니다.
- 기존 `componentType` 라벨 문자열이 바뀌므로 라벨을 하드코딩해 필터링하거나 스타일링하는 코드가 있다면 함께 업데이트해야 합니다. 현재 `ComponentsCard`는 라벨을 Badge 텍스트로만 사용하므로 영향 없습니다.
