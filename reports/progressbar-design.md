# ProgressBar 설계안

`reports/progressbar.md`(접근성 요구사항 46건)와 Figma Meter 페이지(`48465:3518`)를 입력으로 삼아
ProgressBar의 **책임 분해 · Figma 페이지 구성 · 컴포넌트 스펙**을 정한다.

- 규범 출처: `reports/progressbar.md` (WCAG 2.2 A/AA + KWCAG 2.2, APG range widget practices)
- 패턴 출처: Figma `❖ Meter` 캔버스 6프레임 (Introduction/Overview/Anatomy & Variants/Color/Measurements/Accessibility)
- 설계 원칙 출처: Notion 「💙 Component 구성 원칙」 (Anatomy 3분류 → Layer 4종 → Spec 5분류)
- 기반 구현체: `@base-ui/react@^1.6.0` `Progress` (5파트: Root · Label · Track · Indicator · Value)
- 대상 Figma 캔버스: `oXY3kjc56sC6PpQkRgT1pB` / `48647:308` (`❖ ProgressBar`, **현재 비어 있음**)

> **개정 2026-08-27.** 초판의 미결 쟁점 3건이 codex 검증(`reports/progressbar-design-review.md`)에서
> 전부 B안으로 닫혔다. 초판은 "새 prop을 뚫지 않는다"를 Notion §3의 Prop 폭발 방지로 정당화했으나,
> Notion §3.2는 `invalid` 같은 **논리적 상태**를 허용 분류로 명시하고 §1.2는 접근성용 **기능적
> Anatomy**를 명시한다. 즉 접근성 규범과 Notion 원칙은 애초에 충돌하지 않았고, 초판이 원칙을
> 과하게 좁게 읽었다. `invalid` · `ProgressBar.Status` · `paused` 셋을 도입한다.

---

## 1. 접근성 준수 책임 분해

접근성 문서 46건을 **누가 구현하는가**와 **누가 회귀를 감시하는가**로 나눠 적는다. 두 열은 다르다 —
base-ui가 구현한 것도 버전을 올릴 때 깨지므로 vapor가 테스트를 갖는다.

| 원문 구획           | 건수 | 구현 책임                            | 회귀 검사 담당      |
| ------------------- | ---: | ------------------------------------ | ------------------- |
| 1. 기반 구현체 위임 |    7 | base-ui                              | vapor (§1.0)        |
| 2. vapor 자체 구현  |   15 | vapor (§1.1 A·B)                     | vapor               |
| 3. 공동(통로)       |   10 | vapor가 통로, 소비자가 내용 (§1.1 C) | vapor (통로 존재만) |
| 4. 소비자           |   14 | 사용처 (§1.2)                        | 사용처              |

46건은 아래 네 절에 **정확히 한 번씩** 나온다.

### 1.0 기반 구현체 위임 — 회귀 검사만 (7건)

base-ui가 이미 보장한다. vapor는 구현하지 않고 **테스트로 감시**한다.

| 요구사항                            | base-ui 현황                                                   | vapor의 회귀 검사                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `progressbar-role`                  | 지원 — Root가 `role="progressbar"`                             | 렌더 결과에 `role="progressbar"`가 있는지                                                                               |
| `platform-api-exposure`             | 지원(determinate) — 접근성 트리에 `progressbar "<이름>": <값>` | determinate·indeterminate **양쪽** 접근성 트리 노출. indeterminate 노드가 트리에서 사라진 관측 1건이 있어 특히 감시한다 |
| `value-attributes-reflect-progress` | 지원 — `aria-valuenow`/`min`/`max` 배선                        | `min=10 max=20 value=15`에서 세 속성이 그대로 나오는지                                                                  |
| `indeterminate-omits-valuenow`      | **부분** — 속성은 맞으나 접근성 트리 미노출 관측 1건           | `value={null}`에서 `aria-valuenow` 부재 + `data-indeterminate` 존재                                                     |
| `value-not-announced-twice`         | 지원 — `Progress.Value`가 항상 `aria-hidden="true"`            | Value 노드에 `aria-hidden="true"`가 붙는지                                                                              |
| `label-part-associates-name`        | 지원 — `Label`이 `aria-labelledby`를 자동 배선                 | Label 렌더 시 Root의 `aria-labelledby`가 Label의 `id`를 가리키는지                                                      |
| `unique-ids`                        | 지원 — 인스턴스마다 고유 id 생성                               | 같은 페이지에 3개를 렌더해 id 충돌이 없는지                                                                             |

### 1.1 컴포넌트 개발자가 구현할 것 (25건 = 값 6 + 시각 9 + 통로 10)

**A. 값 계약 — 코드 (6건)**

| 요구사항                     | 해야 할 일                                                                                      | base-ui 현황                                                                                                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `valuenow-within-range`      | `value`를 `[min, max]`로 클램프한 뒤 `aria-valuenow`에 낸다                                     | 미지원 — `ProgressRoot`가 `value`를 그대로 `aria-valuenow`에 쓴다 (`value={150}` → `aria-valuenow="150"`)                                                                                                                   |
| `declared-range-valid`       | `max > min`을 검증. 위반 시 dev 경고 + 기본 범위(0~100) 폴백                                    | 미지원 — Root에 검증 분기가 없다. `min=100 max=0`도 경고 0건                                                                                                                                                                |
| `valuetext-only-when-needed` | **기본값을 뒤집는다.** 소비자가 값 문구를 주지 않으면 `aria-valuetext`를 **아예 만들지 않는다** | 미지원 — 기본 callback이 determinate·indeterminate 양쪽에서 문자열을 반환해 항상 붙는다. `getAriaValueText={() => undefined}`는 타입 반환형이 `string`이라 **공식 통로가 아니다** — vapor가 기본 동작 자체를 고쳐야 한다    |
| `value-text-matches-fill`    | 값 문구의 백분율을 `(value - min) / (max - min)`로 계산한다                                     | 미지원 — **Indicator fill은 이미 `valueToPercent(value, min, max)`로 맞다. 어긋나는 것은 기본 ARIA 문구뿐**으로, `formatNumberValue`가 `value / 100`을 쓴다. `value=15 min=10 max=20` → fill 50%인데 `aria-valuetext="15%"` |
| `value-text-matches-visible` | `aria-valuetext`와 `ProgressBar.Value`가 **한 값에서 갈라져 나오게** 묶는다                     | 미지원 — `ProgressValue`는 context의 `formattedValue`를, Root는 별도 `getAriaValueText`를 읽어 `"3 of 8 files"` vs 보이는 `"3%"` 불일치가 가능하다                                                                          |
| `value-text-localized`       | 컴포넌트가 스스로 주입하는 문구를 페이지 언어로. **더 나은 해법은 주입 자체를 안 하는 것**      | 미지원 — locale과 무관하게 `"indeterminate progress"` 고정. vapor는 이 기본 문구를 **제거**한다(§3.4)                                                                                                                       |

**B. 시각 계약 — CSS (9건)**

| 요구사항                              | 해야 할 일                                                                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `indeterminate-not-shown-as-complete` | `[data-indeterminate]`에서 Indicator 폭을 부분 폭으로 고정. base-ui는 indeterminate에서 style `{}`를 반환하므로 그대로 두면 100%가 된다 |
| `status-not-color-only`               | 완료·진행·실패를 색 말고도 가른다. **`invalid`는 Track 테두리 굵기 1px → 2px(비색상 단서), 문구는 Label/Value(콘텐츠).** 색만 바뀌는 1px hint → 1px danger는 hue 단서일 뿐이므로 근거가 되지 못한다. Figma Guideline·Docs에도 강제 |
| `indeterminate-motion-reduced`        | `prefers-reduced-motion: reduce`에서 애니메이션 제거. `[data-paused]`와 **같은 정적 표현**을 쓴다 (부분 기여)                           |
| `indeterminate-flash-threshold`       | keyframe이 **위치만** 바꾸고 밝기·색을 점멸시키지 않게 한다. 주기 길이만으로 판정하지 않는다(§3.6)                                      |
| `indicator-track-contrast`            | Indicator ↔ Track 3:1 이상                                                                                                              |
| `track-adjacent-contrast`             | Track ↔ 페이지 배경 3:1 **또는** 1px `border-hint` 테두리                                                                               |
| `text-resize-200`                     | Label/Value 행과 Root에 **고정 높이를 주지 않는다**                                                                                     |
| `text-spacing`                        | 같은 이유 — 행 높이를 고정하지 않는다. 높이를 갖는 레이어는 Track 하나뿐                                                                |
| `reflow-320`                          | 폭은 컨테이너에서 받는다. 최소 폭을 두지 않는다                                                                                         |

**C. 통로 뚫기 — API (10건)**

| 요구사항                         | 뚫을 통로                                                                                                                                                                                           | 상태                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `accessible-name-slot`           | `ProgressBar.Label` + Root `aria-label` 패스스루. **통로 제공과 "이름 없이 렌더되지 않게 하기"는 다른 일이다** — base-ui는 이름 없는 Root를 그대로 렌더하므로 vapor가 dev 경고 + 회귀 검사를 붙인다 | base-ui 통로 + vapor 경고                                                   |
| `visible-label-in-name`          | `ProgressBar.Label` (Label과 `aria-label`을 같이 주면 `aria-labelledby`가 이긴다)                                                                                                                   | base-ui 제공                                                                |
| `label-slot`                     | `ProgressBar.Label` (children 자유)                                                                                                                                                                 | base-ui 제공                                                                |
| `consistent-identification`      | `colorPalette` 어휘 + **컴포넌트 선택 가이드(Meter vs ProgressBar)** + 상태 문구 어휘까지 계약에 포함한다                                                                                           | vapor 신규                                                                  |
| `value-text-slot`                | `getAriaValueText` / `format` / `locale` 패스스루                                                                                                                                                   | base-ui 제공                                                                |
| `error-state-slot`               | **`invalid` prop** (§3.3 논리적 상태) + `data-invalid` 훅 + `aria-describedby` 패스스루                                                                                                             | vapor 신규 — base-ui의 상태는 `progressing`·`complete`·`indeterminate` 셋뿐 |
| `status-message-slot`            | **`ProgressBar.Status` 파트** (§3.1 기능적 Anatomy). 완료·실패를 한 번만, 매 tick 금지                                                                                                              | vapor 신규 — base-ui에 `aria-live`/`status`/`alert` 구현 0개                |
| `default-token-contrast`         | 기본 토큰 짝 고정 + `className`·`style`·`render` 교체 통로                                                                                                                                          | base-ui 제공                                                                |
| `orientation-fluid-width`        | 폭 미고정                                                                                                                                                                                           | base-ui 제공                                                                |
| `indeterminate-motion-stop-slot` | **`paused` prop** (§3.3 논리적 상태). `className` 오버라이드는 내부 CSS 이름에 기대는 계약이라 안정적이지 않다                                                                                      | vapor 신규                                                                  |

### 1.2 사용처(사용자)가 준수할 것 (14건)

Figma Accessibility 프레임의 「사용처가 책임지는 항목」 표와 Docs에 그대로 싣는다.

| 요구사항 ID                         | 항목                    | 기준 SC             | 사용처가 할 일                                                                                |
| ----------------------------------- | ----------------------- | ------------------- | --------------------------------------------------------------------------------------------- |
| `accessible-name-content`           | 접근 이름               | 4.1.2 · KWCAG 8.2.1 | `ProgressBar.Label`을 렌더하거나 Root에 `aria-label`을 넘긴다                                 |
| `visible-label-consistency`         | 보이는 문구와 이름 일치 | 2.5.3               | `aria-label`을 쓸 때 화면에 보이는 문구를 그대로 포함한다                                     |
| `label-content`                     | 레이블 내용             | 2.4.6               | 위젯이 아니라 **작업**을 이름 짓는다. "진행률"이 아니라 "파일 업로드"                         |
| `consistent-usage`                  | 컴포넌트 선택           | 3.2.4               | 시작과 끝이 있는 작업에만 쓴다. 계기·점수·비율은 Meter                                        |
| `value-text-content`                | 값 문구                 | 4.1.2               | 백분율이 의미 없으면 `getAriaValueText`로 실제 단위를 준다 ("8개 중 3개")                     |
| `error-message-content`             | 오류 메시지             | 3.3.1               | 무엇이 실패했는지 **글자로** 쓴다. `invalid`만 켜고 문구를 빼면 안 된다                       |
| `error-suggestion`                  | 복구 안내               | 3.3.3               | 원인을 알면 다음 행동을 제시한다 ("다시 시도", "파일이 너무 큽니다")                          |
| `status-message-content`            | 상태 알림               | 4.1.3               | `ProgressBar.Status`에 완료·실패를 **한 번** 넣는다. 진행 중 매 틱을 넣지 않는다              |
| `custom-color-contrast`             | 색 오버라이드           | 1.4.3 · 1.4.11      | 색을 바꿔도 텍스트 4.5:1, 인디케이터 3:1을 유지한다                                           |
| `orientation-no-lock`               | 화면 방향               | 1.3.4               | 막대를 맞추려고 화면 방향을 잠그지 않는다                                                     |
| `indeterminate-motion-stop-control` | 자동 움직임 정지        | 2.2.2               | indeterminate가 5초를 넘겨 다른 콘텐츠와 함께 보이면 **실제 버튼**을 주고 `paused`를 토글한다 |
| `sensory-instructions`              | 감각 특성 지칭 금지     | 1.3.3               | "막대가 초록이 될 때까지" 같은 안내를 쓰지 않는다                                             |
| `language-of-parts`                 | 부분 언어 표시          | 3.1.2               | 페이지 언어와 다른 레이블에 `lang`을 붙이고 `locale`을 맞춘다                                 |
| `audio-control`                     | 소리 제어               | 1.4.2               | 진행에 3초 넘는 소리를 붙이면 제어 수단을 준다                                                |

---

## 2. Figma 페이지 추가 방안

`❖ ProgressBar` 캔버스(`48647:308`)는 비어 있다. Meter 캔버스의 구성을 **그대로** 복제하고 내용만 갈아 끼운다.

### 2.1 Meter 캔버스 구조 (기준)

```
canvas "❖ Meter"
└ section "Meter"
  ├ symbol  🟨Meter.Label/SlotLayer
  ├ symbol  🟨Meter.Value/SlotLayer
  ├ frame   💙Meter                    ← 컴포넌트 세트 (colorPalette 4 × size 3 = 12 variant)
  ├ frame   Meter                      ← Introduction + Component Spec(Anatomy·Spec 표)
  ├ frame   Overview                   ← Guidelines 4 (Do/Caution 짝) + Usecase 3
  ├ frame   Anatomy & Variants         ← Anatomy 번호 도해 + Layer 트리 + Variant 매트릭스 + 매핑 표
  ├ frame   Color                      ← 색 바인딩 표 + 대비 검증 표 + 팔레트별 대비 표
  ├ frame   Measurements               ← size 축 표 + 고정값 표 + 크기 규칙 표 + size 비교
  └ frame   Accessibility              ← 이미 만족 표 + 사용처 책임 표 + 컴포넌트 선택 표
```

### 2.2 ProgressBar 캔버스 계획

같은 8개 노드. **차이 나는 곳만** 적는다.

| 노드               | Meter와 같은 것                   | ProgressBar에서 달라지는 것                                                                       |
| ------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| SlotLayer 심볼 2개 | 구조·크기 동일                    | 이름만 `🟨ProgressBar.Label/SlotLayer`, `🟨ProgressBar.Value/SlotLayer`                           |
| 💙 컴포넌트 세트   | 축 이름·정렬 동일                 | **`state` 축이 추가되어 48 variant** (아래)                                                       |
| Introduction       | 레이아웃 동일                     | 설명: "시작과 끝이 있는 작업이 얼마나 진행됐는지 보여주는 컴포넌트"                               |
| Component Spec     | 표 구조 동일                      | 접근성 기능에 `value`가 **nullable**임을, 논리적 상태에 `invalid`·`paused`를 명시                 |
| Overview           | Guidelines/Usecase 이분 구조 동일 | **Guideline 5개**(Meter 4개) — indeterminate 항목 추가                                            |
| Anatomy & Variants | 도해·Layer 트리·매트릭스 동일     | 파트 이름 `ProgressBar.*`. **`ProgressBar.Status`를 "Figma에 그리지 않는 기능적 Anatomy"로 표기** |
| Color              | 표 3개 동일                       | 토큰 값은 Meter와 동일. **`invalid` Track 테두리 2px·`border-danger` 행 1줄 추가**                |
| Measurements       | 표 4개 동일                       | Meter와 같은 수치. **indeterminate 세그먼트 폭·애니메이션 행 추가(검증 대기 표시)**               |
| Accessibility      | 표 3개 동일                       | 「사용처가 책임지는 항목」이 11행 → **14행**(§1.2). 「컴포넌트 선택」 표는 방향만 뒤집는다        |

**컴포넌트 세트 축 (48 variant)**

| 축             | 값                                             | 대응 React                                      |
| -------------- | ---------------------------------------------- | ----------------------------------------------- |
| `colorPalette` | primary · success · warning · danger           | `colorPalette`                                  |
| `size`         | sm · md · lg                                   | `size`                                          |
| `state`        | determinate · indeterminate · paused · invalid | `value` / `value={null}` / `paused` / `invalid` |

`state` 축은 논리적 상태 3개(`indeterminate`·`paused`·`invalid`)를 **한 축으로 접은 것**이다.
독립 축 3개로 두면 4 × 3 × 2 × 2 × 2 = 72가 되는데, 실제로 쓰이지 않는 조합이 대부분이다.
접은 근거와 그리지 않는 조합:

- `paused`는 `indeterminate`의 정지 표현이다. determinate는 작업을 따라 움직이므로 자동 움직임이
  아니고, 멈출 대상이 없다. 그래서 `paused`는 `indeterminate`의 형제 값으로 둔다.
- `indeterminate` + `invalid` 조합은 **그리지 않는다.** 길이를 모르는 작업이 실패하면 애니메이션을
  멈추고 determinate `invalid`로 전환하는 것이 규약이다. React에서는 두 prop이 독립이라 조합이
  가능하므로, **이것은 Figma가 그리지 않는 조합이라는 사실을 Anatomy & Variants 프레임에 명시**한다.
  (Notion "Figma Variants = React Props" 원칙의 문서화된 예외 1건)

**`state` 값 ↔ React Prop 조합 (Codegen 규약)**

| Figma `state`   | React가 받는 값                                | `data-*` 훅                        |
| --------------- | ---------------------------------------------- | ---------------------------------- |
| `determinate`   | `value={number}` · `invalid` 미지정 · `paused` 미지정 | `data-progressing` 또는 `data-complete` |
| `indeterminate` | `value={null}` · `paused` 미지정               | `data-indeterminate`               |
| `paused`        | `value={null}` · `paused`                      | `data-indeterminate` + `data-paused` |
| `invalid`       | `value={number}` · `invalid`                   | `data-invalid`                     |

**우선순위** — 두 상태가 겹치면 위가 이긴다 (§3.3):

1. `invalid` — 실패한 작업은 진행 중이 아니다. 애니메이션을 멈추고 `state=invalid`의 시각을 쓴다
2. `paused` — 정지된 indeterminate. 세그먼트는 남기고 움직임만 없앤다
3. `indeterminate` — 움직이는 세그먼트

**Codegen 회귀 사례** — Figma에 없는 조합이 코드로 들어올 때 무엇이 나와야 하는지:

| 입력                                    | 기대 출력                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------- |
| `value={null}` + `invalid`              | `data-invalid` 우선. 애니메이션 없음, 세그먼트 대신 `state=invalid` 시각    |
| `value={40}` + `paused`                 | `paused` 무시. determinate는 자동 움직임이 아니므로 멈출 대상이 없다        |
| `value={null}` + `paused` + `invalid`   | `data-invalid` 우선. 위 첫 줄과 같은 출력                                   |

### 2.3 Overview — Guidelines 5개

| #   | 제목                                            | Do                                    | Caution                          |
| --- | ----------------------------------------------- | ------------------------------------- | -------------------------------- |
| 1   | 측정값에는 쓰지 않습니다                        | "파일 업로드 62%"                     | "저장 공간 8.4GB / 20GB" → Meter |
| 2   | 레이블 없이 두지 않습니다                       | "파일 업로드 · 62%"                   | "62%"만                          |
| 3   | 실패를 색으로만 알리지 않습니다                 | `invalid` + "업로드 실패 · 다시 시도" | 색만 바뀐 막대                   |
| 4   | 고정 폭을 주지 않습니다                         | 카드 폭 따라 늘어남 (가로 FILL)       | 320px에 잠겨 오른쪽이 빔         |
| 5   | 길이를 모르는 작업을 꽉 찬 막대로 두지 않습니다 | 세그먼트 + "처리 중" 문구             | 100% 채워진 막대                 |

### 2.4 Overview — Usecase 3개

| #   | 제목               | 예시                                                                 |
| --- | ------------------ | -------------------------------------------------------------------- |
| 1   | 파일 업로드        | "report.pdf 업로드 · 62%"                                            |
| 2   | 다단계 진행        | "가입 절차 · 8단계 중 3단계" (백분율 아닌 단위는 `getAriaValueText`) |
| 3   | 길이를 모르는 작업 | "서버 응답 대기 중" · indeterminate + 정지 버튼                      |

**Meter와 동일한 함정 주의.** Meter Overview 하단 주석대로, Figma는 인스턴스 안 Indicator 폭을
size-constraints 때문에 오버라이드하지 못한다. 62% 같은 도해는 **인스턴스를 detach해서 정적으로**
그리고, 레이어 이름에 `(정적 도해)`를 박아 마스터 갱신 시 다시 그려야 함을 남긴다.

---

## 3. 컴포넌트 설계

### 3.1 Anatomy (Notion §1)

**시각적 Anatomy — Figma 레이어 ↔ React 컴포넌트 1:1** (5파트)

| #   | 파트                    | 역할                                                                          |
| --- | ----------------------- | ----------------------------------------------------------------------------- |
| 1   | `ProgressBar` (Root)    | 두 시각 축(`colorPalette` · `size`)과 논리 상태를 소유하고 그리드 배치를 담당 |
| 2   | `ProgressBar.Label`     | 진행 중인 **작업의 이름**. 접근 이름(`aria-labelledby`)의 출처                |
| 3   | `ProgressBar.Track`     | 작업 전체 길이. 테두리와 배경을 가진다                                        |
| 4   | `ProgressBar.Indicator` | 진행한 만큼 채워지는 부분. 색은 `colorPalette`가 정한다                       |
| 5   | `ProgressBar.Value`     | 화면에 보이는 값 텍스트                                                       |

Track 안에 Indicator가 중첩되는 것은 1:1 매핑을 깨지 않는다. 1:1은 평면 배치가 아니라
**시각 레이어 하나당 React 파트 하나**를 뜻한다.

**기능적 Anatomy — Figma에 그리지 않고 코드에만 있는 것** (1파트)

| 파트                 | 역할                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| `ProgressBar.Status` | 완료·실패를 포커스 이동 없이 알리는 라이브 리전. 문구는 소비자가 children으로 넣는다 |

**캡슐화된 Anatomy** — 없음. 숨겨야 할 Portal·Overlay가 없다.

### 3.2 Layer (Notion §2)

정적 컨테이너 유형 → **Container + Contents + Slot**. Interaction Layer는 두지 않는다(상호작용 없음).

```
◇ 💙ProgressBar
  ◇ 🟨ProgressBar.Label/SlotLayer
  ◇ 🟨ProgressBar.Value/SlotLayer
  ▭ ProgressBar.Track
    ▭ ProgressBar.Indicator
  (ProgressBar.Status — Slot Layer, Figma에 그리지 않음)
```

- Slot Layer(`Label`·`Value`·`Status`)는 스타일을 정의하지 않는다. 글자 크기는 `size` 축이 정한다.
- `Track`·`Indicator`는 Container Layer. Root는 Contents Layer(그리드 배치)를 겸한다.

**`Status`의 DOM 제약.** `role="progressbar"` 노드의 자손은 접근성 트리에서 presentational로 처리될
수 있다. 그래서 `Status`를 role을 가진 노드의 **자손으로 넣지 않는다.** Root를 래퍼 요소와
role을 가진 내부 요소로 나누고, `Status`를 role 노드의 **형제**로 렌더한다.

### 3.3 Spec (Notion §3)

| Notion 분류        | ProgressBar의 항목                                                                      | Figma Variant | React Prop                                  |
| ------------------ | --------------------------------------------------------------------------------------- | ------------- | ------------------------------------------- |
| 3.1 접근성 및 기능 | `value`(nullable) · `min` · `max` · `format` · `locale` · `getAriaValueText` · `render` | ✗             | ✓                                           |
| 3.2 논리적 상태    | `indeterminate`(=`value === null` 파생) · `invalid` · `paused`                          | ✓             | ✓ (`indeterminate`는 `value={null}`로 표현) |
| 3.3 시각 옵션      | `colorPalette`(primary\|success\|warning\|danger) · `size`(sm\|md\|lg)                  | ✓             | ✓                                           |
| 3.4 인터랙션 상태  | 없음                                                                                    | ✗             | ✗                                           |
| 3.5 콘텐츠 제어    | 없음 — Slot Layer로 주입                                                                | ✗             | ✗                                           |

**`indeterminate`가 Variant인 이유.** `value === null`에서 파생되지만 **시각 표현이 지속되는 논리적
상태**다(§3.2 정의: "로직에 의해 변경되는 지속적인 상태. 시각적 표현이 가능하므로 1:1로 매핑"). 파생
여부는 분류 기준이 아니다. React에는 별도 prop을 두지 않고 `value={null}`이 Figma `state=indeterminate`에
매핑된다는 사실을 Codegen 규약으로 적는다.

**논리적 상태 우선순위** (Notion §3.2 우선순위 전략 적용):
`invalid` > `paused` > `indeterminate`. 실패한 작업은 진행 중이 아니므로 `invalid`가 애니메이션을 멈춘다.

### 3.4 값 계약 (자체 구현의 핵심)

한 함수가 세 곳을 먹인다 — Indicator 폭 · `aria-valuenow`/`aria-valuetext` · `ProgressBar.Value`.

```
clamped = clamp(value, min, max)
percent = (clamped - min) / (max - min)
```

| 출력                | 규칙                                                                                                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Indicator 폭        | `percent × 100%` · indeterminate면 세그먼트 폭(§3.6)                                                                                                                                   |
| `aria-valuenow`     | `clamped` · indeterminate면 **부재**                                                                                                                                                   |
| `aria-valuetext`    | **소비자가 `getAriaValueText`를 줄 때만 붙인다. 기본은 부재** — determinate는 `aria-valuenow`+`min`+`max`만으로 범위 의미가 전달되고, indeterminate는 영어 기본 문구를 주입하지 않는다 |
| `ProgressBar.Value` | `aria-valuetext`와 **같은 값**에서 갈라져 나온다                                                                                                                                       |

`max <= min`이면 dev 환경에서 경고하고 `0~100`으로 폴백한다.
이름(Label·`aria-label`)이 하나도 없으면 dev 환경에서 경고한다.

### 3.5 Color

Meter와 동일한 semantic 변수. 원시 색 없음. 라이트·다크는 같은 변수의 모드로 전환.

| 파트                    | 속성                   | Figma 변수                        | 코드 값                   |
| ----------------------- | ---------------------- | --------------------------------- | ------------------------- |
| `Track`                 | 배경                   | `background/background-secondary` | `background['secondary']` |
| `Track`                 | 테두리 1px             | `border/border-hint`              | `border['hint']`          |
| `Track`                 | 테두리 **2px** (`invalid`) | `border/border-danger`        | `border['danger']`        |
| `Indicator`             | 배경 (primary)         | `background/background-primary`   | `background['primary']`   |
| `Indicator`             | 배경 (success)         | `background/background-success`   | `background['success']`   |
| `Indicator`             | 배경 (warning)         | `background/background-warning`   | `background['warning']`   |
| `Indicator`             | 배경 (danger)          | `background/background-danger`    | `background['danger']`    |
| `Label`·`Value` 안 TEXT | 글자색                 | `foreground/foreground-normal`    | `foreground['normal']`    |

indeterminate 세그먼트는 **새 색을 쓰지 않는다** — 위 `colorPalette` 바인딩을 그대로 재사용한다.
`invalid`는 Indicator 색을 바꾸지 않는다. Track 테두리가 **1px → 2px로 굵어지는 것**이 비색상 단서이고,
색(`border-danger`)은 그 위에 얹는 보조 단서다. 굵기 차이 덕에 `colorPalette="danger"`와
시각적으로 구분되고, 상태와 시각 옵션이 섞이지 않는다.

대비 검증(5단계에서 재측정 대상):

| 요구                               | 기준 SC              | 이 설계의 값                                                     |
| ---------------------------------- | -------------------- | ---------------------------------------------------------------- |
| 인디케이터 ↔ 트랙 3:1              | 1.4.11 / KWCAG 5.4.4 | `*.500` vs `gray.100` = 3.41 ~ 3.51                              |
| 트랙 ↔ 페이지 배경 3:1 또는 테두리 | 1.4.11 / KWCAG 5.4.4 | `gray.100` vs white = 1.31 → **1px `border-hint` 테두리로 충족** |
| 텍스트 ↔ 배경 4.5:1                | 1.4.3 / KWCAG 5.4.3  | `gray.900` vs white = 15.07                                      |
| `invalid` 테두리 ↔ 페이지 배경·트랙 3:1 | 1.4.11          | **미측정 — 5단계에서 `border-danger` vs white·`gray.100`을 라이트·다크 양쪽에서 측정** |

### 3.6 Measurements

`size` 축이 정하는 것은 **트랙 높이와 글자 크기 둘뿐**이다.

| 속성                     | sm                         | md                          | lg                          |
| ------------------------ | -------------------------- | --------------------------- | --------------------------- |
| `Track` 높이             | `size-dimension-100` · 8px | `size-dimension-150` · 12px | `size-dimension-200` · 16px |
| `Label`·`Value` fontSize | `fontSize-050` · 12px      | `fontSize-075` · 14px       | `fontSize-075` · 14px       |

md와 lg의 글자 크기가 같은 것은 Meter를 그대로 따른 것이다 — lg에서 굵어지는 것은 트랙이지 문구가
아니다. 접근성 기준은 size 단계마다 글자가 커질 것을 요구하지 않는다.

size와 무관한 고정값:

| 속성                          | 값                                                                                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 행 간격 (Label/Value ↔ Track) | `size-space-050` · 4px                                                                                                                                   |
| 열 간격 (Label ↔ Value)       | `size-space-000` · 0px (두 열 각각 1fr)                                                                                                                  |
| `Track` 테두리                | 1px · INSIDE (`box-sizing: border-box`)                                                                                                                  |
| `Track` radius                | 9999 (바인딩 없음)                                                                                                                                       |
| `Track` overflow              | **hidden** — **근거는 out-of-range 값이 아니라** 이동하는 indeterminate 세그먼트를 트랙 곡률 안에 가두기 위함이다. determinate는 클램프 후 넘치지 않는다 |
| `Indicator` radius            | 0 (트랙의 clip이 곡률을 만든다)                                                                                                                          |
| Root padding                  | 0                                                                                                                                                        |

**검증 대기 값 — 5단계에서 확정한다.**

| 속성                      | 잠정값                        | 왜 잠정인가                                                                                                                                                                                                                                        |
| ------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| indeterminate 세그먼트 폭 | 30%                           | 정확히 30%여야 할 접근성 근거는 없다. sm(8px) 트랙과 좁은 화면에서도 상태가 구분되는지 시각 검증이 필요하다                                                                                                                                        |
| indeterminate 정지 표현   | 세그먼트 + "처리 중" 문구     | **왼쪽부터 채운 단색 30% 막대를 그대로 멈추면 "30% 완료"로 오독된다.** 정지 시에는 세그먼트를 중앙에 두거나 determinate fill과 다른 패턴을 써서 정량값처럼 보이지 않게 한다. 트랙 전체를 단색으로 채우는 대안은 100% 완료로 오독되므로 쓰지 않는다 |
| 애니메이션 주기           | 1.5s · ease-in-out · infinite | **주기 길이만으로 SC 2.3.1을 판정하지 않는다.** keyframe은 `transform: translateX`로 **위치만** 바꾸고 opacity·색을 건드리지 않는다는 사실이 판정 근거이며, 한 주기 안의 상대 휘도 변화 횟수를 실측해야 한다                                       |

`[data-paused]`와 `prefers-reduced-motion: reduce`는 **같은 정적 표현**을 쓴다. 둘 다
`role="progressbar"` · 접근 이름 · indeterminate 시각 표시를 유지한 채 애니메이션만 제거한다.

크기 규칙:

| 레이어             | 가로                   | 세로                |
| ------------------ | ---------------------- | ------------------- |
| Root (변형 프레임) | FILL (마스터 320)      | HUG                 |
| `Label/SlotLayer`  | FILL (1열)             | HUG                 |
| `Value/SlotLayer`  | FILL (2열) · 우측 정렬 | HUG                 |
| `Track`            | FILL (2열 span)        | FIXED (size가 정함) |
| `Indicator`        | 값에 비례 (SCALE)      | STRETCH             |

**높이를 고정하지 마세요.** Label-Value 행에 height를 주면 텍스트 200% 확대·자간/행간 조정에서
글자가 잘린다(WCAG 1.4.4 · 1.4.12). 높이를 갖는 레이어는 `ProgressBar.Track` 하나뿐이다.

---

## 4. 검증 이력

`reports/progressbar-design-review.md` (codex, 2026-08-27) 판정 결과.

| 쟁점                  | 초판 제안                                    | 판정    | 확정                                                                                                                                                                |
| --------------------- | -------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. error 상태         | `colorPalette="danger"` + `aria-describedby` | **B안** | `invalid` prop (§3.3) — `colorPalette`는 §3.3 시각 옵션이고 `invalid`는 §3.2 논리 상태다. 합치면 색이 오류의 유일한 근거가 되어 `status-not-color-only`와 충돌한다  |
| 2. 완료·실패 알림     | 소비자가 형제 `role="status"` 직접 렌더      | **B안** | `ProgressBar.Status` 파트 (§3.1) — A안은 공동 책임을 소비자에게 되넘긴다. Notion §1.2 기능적 Anatomy + §2.4 무스타일 Slot Layer로 정의되므로 철학과 충돌하지 않는다 |
| 3. indeterminate 정지 | `className` + `prefers-reduced-motion`       | **B안** | `paused` prop (§3.3) — `className`은 내부 CSS 이름에 기대는 계약이고, `prefers-reduced-motion`은 SC 2.2.2의 일시정지·정지·숨김 메커니즘을 대신하지 못한다           |

| 확인 항목                   | 판정                                                         |
| --------------------------- | ------------------------------------------------------------ |
| `aria-valuetext` 기본 제거  | **승인** — indeterminate 영어 기본 문구도 함께 제거          |
| indeterminate 30% 정적 표현 | **보완 필요** — 오독 위험. §3.6 검증 대기 표로 이관          |
| md·lg 글자 크기 동일        | **승인** — Meter 원본과 일치하고 접근성 기준에 어긋나지 않음 |
| Track 안 Indicator 중첩     | **승인** — 1:1 매핑을 깨지 않음                              |

세 쟁점에서 접근성 규범과 Notion 원칙은 실제로 충돌하지 않았다. Notion은 접근성·기능 Prop,
논리적 상태, 기능적 Anatomy를 명시적으로 허용한다. **이후 충돌이 생기면 WCAG/KWCAG 및 WAI-ARIA
요구가 내부의 "최소 Prop / 빈 Slot" 설계 편의보다 우선한다.**
