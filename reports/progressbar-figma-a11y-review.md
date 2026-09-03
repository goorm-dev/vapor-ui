# ProgressBar Figma 접근성 실측

Figma 브랜치 `oXY3kjc56sC6PpQkRgT1pB`의 `❖ ProgressBar`(`48647:308`)를 읽기 전용으로 검사했다. 최종 판정은 **FAIL**이다. 라이트 모드는 주요 대비가 통과하지만, 다크 모드에서 팔레트 4종의 Indicator ↔ Track 대비와 `border-danger` ↔ Track 대비가 3:1에 미달한다.

## 판정 요약

| 항목 | 판정 | 실측값 | 한 줄 근거 |
| --- | --- | --- | --- |
| 전체 | **FAIL** | 다크 Indicator 2.64~2.66:1, 다크 invalid border ↔ Track 1.78:1 | 다크 모드의 핵심 비텍스트 대비가 3:1에 미달한다. |
| `border/border-danger` ↔ canvas-base | PASS | 라이트 4.52:1 · 다크 3.01:1 | 두 모드 모두 3:1 이상이지만 다크는 0.014:1 여유뿐이다. |
| `border/border-danger` ↔ Track | **FAIL** | 라이트 3.45:1 · 다크 1.78:1 | 다크 Track(`#474747`)과 danger border(`#ce2b38`)가 구분되지 않는다. |
| Indicator ↔ Track, 팔레트 4종 | **FAIL** | 라이트 3.44~3.46:1 · 다크 2.64~2.66:1 | Color 프레임의 3.41~3.51 표는 이 파일의 실제 다크 변수값과 일치하지 않는다. |
| Label·Value 텍스트 ↔ canvas-base | PASS | 라이트 15.13:1 · 다크 15.06:1 | 두 모드 모두 4.5:1을 충분히 넘는다. |
| Track 경계 ↔ canvas-base | **FAIL** | `border-hint`: 라이트 6.58:1 · 다크 2.99:1 | 다크는 반올림 전 2.9931:1로 3:1에 미달한다. |
| indeterminate 30% 세그먼트 | PASS | 96/320px(30%), x=48px · determinate 134.4/320px(42%), x=0px | sm 8px에서도 왼쪽에 붙은 정량 fill과 떠 있는 세그먼트가 구분되고 Value도 `처리 중`이다. |
| paused 중앙 세그먼트 | CONDITIONAL | 96/320px, x=112px(35~65%) · Value `처리 중 (일시정지)` | 현재 예시는 텍스트 덕분에 오독 위험이 낮지만, 그래픽만 남으면 구간값으로 읽힐 수 있다. |
| invalid 비색상 단서 | CONDITIONAL | 1px → 2px, sm 8px Track의 내부 가용 높이 6px → 4px | 굵기 변화 자체는 비색상 단서지만 2px INSIDE stroke가 Indicator 높이의 50%를 덮는다. |
| variant 구조 | PASS | 4 palette × 3 size × 4 state = 48개 | 누락·중복·잘못된 이름이 없고 variant property 값도 정확하다. |
| semantic 색 바인딩 | PASS | master 240 paints, raw 0 · SlotLayer raw 0 · 정적 도해 6개 raw 0 | invalid stroke를 포함한 모든 ProgressBar 색이 semantic 변수에 바인딩됐다. |
| 문서 6프레임 정합 | **FAIL** | Color·Accessibility의 대비값 오류, Anatomy Codegen 표 축약, Measurements 문구 충돌 | 구조와 대부분의 내용은 맞지만 접근성 판정을 뒤집는 오류가 남았다. |
| Accessibility의 사용처 책임 표 | PASS | 14행 | `reports/progressbar-design.md` §1.2의 14건과 항목·순서·행동이 일치한다. |

## 대비 실측

### 실제 변수값

Figma 변수의 `light`·`dark` mode에서 alias를 primitive 종착값까지 따라갔다. `canvas-base`는 파일에서 `color-background-canvas-100`으로 저장돼 있다. 컴포넌트 세트가 실제로 놓인 Section(`48680:48`)의 외부 면은 별도 변수인 `color-background-canvas-200`이다.

| 변수 | 라이트 hex | 다크 hex | 비고 |
| --- | --- | --- | --- |
| `color-background-canvas-100` (canvas-base) | `#ffffff` | `#232323` | 페이지 기본 면 |
| `color-background-canvas-200` (실제 Section 면) | `#f7f7f7` | `#282828` | `48680:48`의 fill |
| `background/background-secondary` | `#e1e1e1` | `#474747` | Track fill |
| `border/border-hint` | `#5d5d5d` | `#6c6c6c` | 일반 Track stroke |
| `border/border-danger` | `#da3944` | `#ce2b38` | invalid Track stroke |
| `background/background-primary` | `#2a72e5` | `#368aed` | primary Indicator |
| `background/background-success` | `#058765` | `#259a77` | success Indicator |
| `background/background-warning` | `#d34701` | `#e65f08` | warning Indicator |
| `background/background-danger` | `#da3944` | `#f14f5a` | danger Indicator |
| `foreground/foreground-normal` | `#262626` | `#fafafa` | Label·Value text |

### 계산식

각 8-bit sRGB 채널을 0~1로 정규화한 뒤 WCAG 상대 휘도를 계산했다.

```text
c_linear = c_sRGB / 12.92                              (c_sRGB <= 0.04045)
c_linear = ((c_sRGB + 0.055) / 1.055) ^ 2.4           (그 외)
L = 0.2126R + 0.7152G + 0.0722B
contrast = (L_lighter + 0.05) / (L_darker + 0.05)
```

다크 invalid border 예시는 다음과 같다.

```text
#ce2b38 → linear RGB (0.617207, 0.024158, 0.039546) → L = 0.151351
#474747 → linear RGB (0.063010, 0.063010, 0.063010) → L = 0.063010
(0.151351 + 0.05) / (0.063010 + 0.05) = 1.7817:1 → FAIL
```

판정에는 표시용 반올림값이 아니라 반올림 전 대비비를 사용했다.

### 실측 결과

| 전경 변수 ↔ 배경 변수 | 라이트 hex · 대비비 | 다크 hex · 대비비 | 기준 | 판정 |
| --- | --- | --- | --- | --- |
| `border/border-danger` ↔ `color-background-canvas-100` | `#da3944` ↔ `#ffffff` · **4.5163:1** | `#ce2b38` ↔ `#232323` · **3.0139:1** | 3:1 | PASS |
| `border/border-danger` ↔ `background/background-secondary` | `#da3944` ↔ `#e1e1e1` · **3.4537:1** | `#ce2b38` ↔ `#474747` · **1.7817:1** | 3:1 | **FAIL** |
| `border/border-danger` ↔ 실제 Section 면 | `#da3944` ↔ `#f7f7f7` · **4.2157:1** | `#ce2b38` ↔ `#282828` · **2.8272:1** | 3:1 | **FAIL** |
| `background/background-primary` ↔ Track | `#2a72e5` ↔ `#e1e1e1` · **3.4633:1** | `#368aed` ↔ `#474747` · **2.6613:1** | 3:1 | **FAIL** |
| `background/background-success` ↔ Track | `#058765` ↔ `#e1e1e1` · **3.4461:1** | `#259a77` ↔ `#474747` · **2.6402:1** | 3:1 | **FAIL** |
| `background/background-warning` ↔ Track | `#d34701` ↔ `#e1e1e1` · **3.4376:1** | `#e65f08` ↔ `#474747` · **2.6568:1** | 3:1 | **FAIL** |
| `background/background-danger` ↔ Track | `#da3944` ↔ `#e1e1e1` · **3.4537:1** | `#f14f5a` ↔ `#474747` · **2.6574:1** | 3:1 | **FAIL** |
| `foreground/foreground-normal` ↔ canvas-base | `#262626` ↔ `#ffffff` · **15.1335:1** | `#fafafa` ↔ `#232323` · **15.0578:1** | 4.5:1 | PASS |
| `border/border-hint` ↔ canvas-base | `#5d5d5d` ↔ `#ffffff` · **6.5847:1** | `#6c6c6c` ↔ `#232323` · **2.9931:1** | 3:1 | **FAIL** |

Color 프레임(`48680:422`)의 팔레트 표는 모두 현재 변수와 다르다.

| 팔레트 | Figma 표 라이트 / 다크 | 재계산 라이트 / 다크 | 판정 |
| --- | --- | --- | --- |
| primary | 3.51 / 3.46 | **3.4633 / 2.6613** | 다크 FAIL |
| success | 3.51 / 3.41 | **3.4461 / 2.6402** | 다크 FAIL |
| warning | 3.42 / 3.51 | **3.4376 / 2.6568** | 다크 FAIL |
| danger | 3.48 / 3.43 | **3.4537 / 2.6574** | 다크 FAIL |

## 시각 판정

### indeterminate

`state=indeterminate`의 Indicator는 모든 size에서 96px, 즉 320px Track의 정확히 30%다. sm variant `48686:92674`의 Track은 320×8px이고 Indicator(`48686:92678`)는 x=48px, 96×8px다. determinate sm `48680:59`는 Indicator가 x=0px, 134.4px(42%)이며 Value가 `42%`다.

왼쪽 시작점에 붙지 않은 48px offset, 30% 세그먼트, `처리 중` Value가 함께 있으므로 sm에서도 determinate 42%와 혼동되지 않는다. Figma 정적 시안에는 CSS keyframe이 없으므로 1.5s 이동·휘도 변화 횟수는 이 파일만으로 확인할 수 없다.

### paused

paused sm `48686:92758`의 Indicator(`48686:92762`)는 x=112px, 96×8px다. 320px Track의 35~65% 구간에 정확히 중앙 정렬된다. Value는 `처리 중 (일시정지)`라서 현재 예시 전체를 보면 정량 완료값으로 읽힐 위험은 낮다.

다만 중앙의 단색 막대만 보면 선택 구간 또는 “35%부터 65%까지 완료”로 읽힐 수 있다. Label·Value는 SlotLayer라서 소비자가 이 문구를 바꿀 수 있으므로 그래픽 단독 판정은 CONDITIONAL이다. 더 강한 표현이 필요하면 같은 semantic Indicator 색을 유지한 채 중앙 세그먼트에 반복 패턴 또는 분할 간격을 넣고, 보이는 Value에 `일시정지` 문구를 유지한다.

### invalid

invalid의 1px → 2px 굵기 변화는 hue가 사라져도 남으므로 `status-not-color-only`의 비색상 단서로 기능한다. 기본 예시도 Label을 `업로드 실패 · 다시 시도`로 바꿔 텍스트 단서를 함께 준다.

문제는 stroke 배치다. invalid sm `48686:92842`의 Track(`48686:92845`)은 320×8px, 2px INSIDE stroke다. 위·아래에서 각각 2px를 차지해 Indicator가 보이는 세로 영역을 8px에서 4px로 줄인다. 진행 길이의 끝점은 남지만 Indicator 높이의 50%를 덮으므로 “가리지 않는다”고 판정할 수 없다. 2px OUTSIDE stroke 또는 별도 외곽 outline로 옮기면 굵기 단서는 유지하면서 Indicator를 보존할 수 있다.

## 구조 검증

### variant 48개

컴포넌트 세트 `💙ProgressBar`(`48680:53`)는 자식 48개가 모두 `COMPONENT`다. `variantGroupProperties`도 다음 세 축을 정확히 노출한다.

| 축 | 실제 값 | 조합 수 |
| --- | --- | ---: |
| `colorPalette` | primary · success · warning · danger | 4 |
| `size` | sm · md · lg | 3 |
| `state` | determinate · indeterminate · paused · invalid | 4 |

`colorPalette=…, size=…, state=…` 형식으로 48개 조합을 전수 대조했다. 누락 0, 중복 0, 규약 밖 이름 0이다. 각 variant에는 Track과 Indicator가 정확히 1개씩 있다.

### 바인딩

컴포넌트 세트의 visible SOLID fill·stroke 240개를 전수 검사했다. 원시 색은 0개다. 사용한 시작 변수는 다음 8개이며 모두 semantic collection의 remote 변수다.

- `foreground/foreground-normal`
- `background/background-secondary`
- `border/border-hint`
- `border/border-danger`
- `background/background-primary`
- `background/background-success`
- `background/background-warning`
- `background/background-danger`

Label·Value SlotLayer(`48680:49`, `48680:51`)와 문서 안 정적 ProgressBar 도해 6개도 raw paint 0개다. invalid 12개 Track stroke도 전부 `border/border-danger`에 바인딩됐다.

고정 token-review 추출기는 remote alias를 가져온 뒤 collection tier를 복원하지 못해 대표 invalid variant의 다섯 색을 `unknown-token`으로 오탐했다. 같은 노드의 `boundVariables` ID를 직접 읽고 alias chain을 light·dark mode별로 끝까지 따라가 semantic 변수명과 primitive 종착값을 확인했으므로, 이 결과를 raw 또는 깨진 alias로 판정하지 않았다. typography는 대표 sm의 Label·Value 모두 `fontSize` 변수에 바인딩된 `var-only`로 통과했다.

### 문서 정합

| 프레임 | 판정 | 대조 결과 |
| --- | --- | --- |
| ProgressBar `48680:114` | PASS | 5개 시각 Anatomy + Status, nullable value, invalid·paused·indeterminate, 시각 옵션이 설계안과 맞는다. |
| Overview `48680:213` | PASS | Guideline 5개와 Usecase 3개가 §2.3·§2.4와 맞는다. |
| Anatomy & Variants `48680:297` | CONDITIONAL | 48축 표는 맞지만 React 매핑 셀과 주석에 상태 우선순위·겹침 회귀 사례가 빠졌다. |
| Color `48680:422` | **FAIL** | 실제 다크 변수 대비가 3:1 미만인데 3.41~3.51과 PASS로 적었다. 텍스트 15.07도 실제 라이트 15.13, 다크 15.06과 다르다. |
| Measurements `48680:587` | CONDITIONAL | 표의 수치는 맞지만 머리말의 “높이는 고정하지 않습니다”가 Track 높이를 size별로 고정한다는 §3.6과 충돌한다. |
| Accessibility `48680:731` | **FAIL** | “이미 만족” 표의 Indicator 대비·Track 경계·invalid 단서 설명이 이번 실측과 맞지 않는다. |

Accessibility의 「사용처가 책임지는 항목」은 14행이다. 다음 §1.2 ID와 같은 순서로 정확히 일치한다: `accessible-name-content`, `visible-label-consistency`, `label-content`, `consistent-usage`, `value-text-content`, `error-message-content`, `error-suggestion`, `status-message-content`, `custom-color-contrast`, `orientation-no-lock`, `indeterminate-motion-stop-control`, `sensory-instructions`, `language-of-parts`, `audio-control`.

## 수정 지시

Figma 파일은 수정하지 않았다. 아래는 다음 편집자가 적용할 지시다.

| 노드 | 수정 내용 |
| --- | --- |
| 컴포넌트 세트 `48680:53` | 다크 mode에서 Indicator 4종과 Track의 조합이 3:1 이상이 되도록 semantic alias를 다시 고른다. 가장 작은 범위의 해결은 ProgressBar 전용 Track alias를 두고 dark에서 더 어두운 semantic surface로 연결하는 것이다. 후보를 정한 뒤 네 팔레트를 모두 재측정한다. |
| invalid Track 12개: `48686:92840`, `48686:92845`, `48686:92850`, `48686:92855`, `48686:92860`, `48686:92865`, `48686:92870`, `48686:92875`, `48686:92880`, `48686:92885`, `48686:92890`, `48686:92895` | 2px stroke를 `INSIDE`에서 `OUTSIDE` 또는 외곽 outline로 옮긴다. `border/border-danger` dark 값 또는 component alias도 canvas-base·실제 Section 면·Track 세 면에 모두 3:1 이상이 되게 조정한다. |
| paused component 12개 `48686:92753`~`48686:92808`의 Indicator | 중앙 단색 세그먼트만으로 상태를 전달해야 한다면 패턴 또는 분할 간격을 추가한다. Value의 `처리 중 (일시정지)` 문구는 유지한다. |
| Color `48680:530` | “3.41 ~ 3.51 ✔”을 light 3.4376~3.4633 PASS / dark 2.6402~2.6613 FAIL로 바꾼다. |
| Color `48680:563`, `48680:565`, `48680:570`, `48680:572`, `48680:577`, `48680:579`, `48680:584`, `48680:586` | 팔레트별 값을 각각 3.4633/2.6613, 3.4461/2.6402, 3.4376/2.6568, 3.4537/2.6574로 고친다. |
| Color `48686:92938` | invalid 대비를 light canvas 4.5163 / Track 3.4537, dark canvas 3.0139 / Track 1.7817로 쓰고 전체 FAIL로 바꾼다. 실제 Section dark 2.8272도 주석에 남긴다. |
| Color `48680:539`, `48680:546` | Track 경계는 dark `border-hint` 2.9931로 FAIL임을 적는다. 텍스트는 light 15.1335, dark 15.0578로 고친다. |
| Accessibility `48680:751`, `48680:758`, `48680:765`, `48680:793` | “이미 만족” 주장을 이번 실측과 맞춘다. Indicator·Track 경계는 dark FAIL, 텍스트는 양쪽 PASS, invalid는 굵기 단서 PASS지만 sm 내부 가림 CONDITIONAL로 적는다. |
| Anatomy & Variants `48686:92992`, `48680:421` | state 매핑을 `determinate=value={number}`, `indeterminate=value={null}`, `paused=value={null}+paused`, `invalid=value={number}+invalid`로 풀어 쓴다. `invalid > paused > indeterminate` 우선순위와 설계안 §2.2의 겹침 3사례를 추가한다. |
| Measurements heading instance `48680:589` | “폭과 높이는 고정하지 않습니다”를 “Root 폭과 Label·Value 행 높이는 고정하지 않습니다. Track 높이는 size가 정합니다”로 고친다. |
| Measurements `48680:650`, `48680:652`, `48686:92964`, `48686:92966` | invalid stroke 배치 변경과 paused 패턴/문구 결정을 반영하고 “검증 대기”를 최종 판정으로 바꾼다. |

수정 뒤에는 Color와 Accessibility의 PASS 문구를 먼저 지운 상태에서 재측정하고, 반올림 전 값으로 3:1 이상인지 확인해야 한다.
