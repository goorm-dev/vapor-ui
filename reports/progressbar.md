# ProgressBar 접근성 요구사항

ProgressBar가 충족해야 하는 접근성 요구사항 목록이다. **구현 전 설계 입력이며 판정이 아니다** —
vapor ProgressBar는 아직 없다.

- 규범: WCAG 2.2 Level A/AA + KWCAG 2.2
- 대상 APG 패턴: **패턴 없음, 실무 문서 있음** — APG 30개 패턴에 progressbar는 없다. 대신 APG
  practices 문서 「Communicating Value and Limits for Range Widgets」가 `progressbar`를 range
  widget 6종(meter · progressbar · scrollbar · separator · slider · spinbutton) 중 하나로 명시하고
  `Range properties with progress bars` 절과 기본값·필수 표로 위젯 계약을 직접 정의한다. **이
  문서가 계약의 1차 출처이고 MDN role 문서는 보조다.** Meter 패턴은 빌리지 않는다 — meter는
  **고정 척도 위의 순간값 계기**고 progressbar는 **완료를 향하는 작업의 진행 상태**다. 이 구분이
  규범이다. 반면 **단조 증가와 종료 시 100% 도달은 규범이 아니라 이 문서의 「설계 가정」**이다 —
  WAI-ARIA와 APG는 작업 완료의 진행 상태로만 정의하고 값이 내려가지 않을 것도, 반드시 100%에
  닿을 것도 요구하지 않는다(총 작업량이 재추정되면 진행률이 내려가는 progressbar도 정상이다)
- 기반 구현체: base-ui `Progress` (2026-08-21 확인. 5파트 조합형 — `Root` `Label` `Track`
  `Indicator` `Value`. 네이티브 `<progress>`를 쓰지 않고 `div` + `role="progressbar"`로
  구현한다. 레포 의존성은 `@base-ui/react@^1.6.0`)
- 증거: `@base-ui/react@1.6.0` 로컬 하니스 실측(React 19.2.0, unstyled + 200×8px 트랙,
  `<html lang="ko">`, 뷰포트 1280×900, 2026-08-21). prop 조합 10개 — `value={40}`(기본) /
  `getAriaValueText={() => undefined}` / `value={150}` / `value={-30}` /
  `value={15} min={10} max={20}` / `value={null} locale="ko"` / `min={100} max={0}` /
  `min={5} max={5}` / `format={{style:'decimal'}} max={8}` / 커스텀 `getAriaValueText`.
  보조로 <https://base-ui.com/react/components/progress> 데모(`value=69`)와
  axe-core 4.12.1 자동 훑기
- 요구사항 수: 기반 구현체 위임 7 / vapor 자체 구현 15 / 공동 10 / 소비자 14
- 위임 판정: 지원 6 / 다른 방식 0 / 부분 1 / 명세 위임 0 / 미지원 15 / 슬롯 제공 10 / 확인 불가 0 / 해당 없음 14
- SC 판정: 60 = 채택 23 + 제외 37

> **초판(2026-08-20) 정정.** 초판은 "APG에 progressbar 계약이 없다"고 적고 위젯 계약을 MDN role
> 문서만으로 채웠다. APG practices 문서를 1차 출처로 올린 결과 요구사항이 6개 늘었고, 그 6개는
> 전부 `2. vapor 자체 구현`으로 떨어졌다 — 값의 범위 유효성, `aria-valuetext` 기본값,
> indeterminate 문구의 언어, 값 텍스트 삼중 정합, indeterminate의 시각 표현이다.

> **2026-08-25 정정 2건.** ① SC 2.2.2 — `indeterminate-motion-reduced`를 **부분 기여**로 내리고
> (`prefers-reduced-motion`은 2.2.2의 충족 기법 목록에 없다) 정지 수단 요구사항 둘을 신설했다:
> `3. 공동(통로)` / `indeterminate-motion-stop-slot`, `4. 소비자` /
> `indeterminate-motion-stop-control`. 그래서 요구사항 수가 44 → 46이 됐다. **determinate 구간은
> 작업을 따라 움직이므로 자동 움직임이 아니고, 무한 반복인 indeterminate만 걸린다.**
> ② 헤더의 「단조 증가」를 규범에서 **설계 가정**으로 내렸다(부록 D 11번의 `value-widget` 태그
> 신설 권고 철회도 같은 날이다). 채택/제외 SC 집합은 둘 다 바뀌지 않는다.

## 1. 기반 구현체 위임

base-ui `Progress`가 실측으로 보장하는 요구사항. 관측한 마크업은 아래 한 덩이다
(`value={40}`, 하니스 c1).

```html
<div
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="40"
    aria-valuetext="40%"
    aria-labelledby="base-ui-_r_0_"
    data-progressing
>
    <span id="base-ui-_r_0_" role="presentation">Task c1</span>
    <span aria-hidden="true">40%</span>
    <div class="Track"><div style="inset-inline-start:0;height:inherit;width:40%"></div></div>
    <span role="presentation" style="/* visually hidden */">x</span>
</div>
```

### role

### progressbar-role

|             |                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| 요구사항    | The root must expose `role="progressbar"` to assistive technology.                                           |
| 근거        | WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1 · APG range widget 목록 (정보성)                                             |
| 이유        | Without the role a screen reader user hears only a label and never learns that a task is in progress at all. |
| 기반 구현체 | 지원 — 관측 `role="progressbar"`, 접근성 트리 `progressbar "Task c1-default-40": 40`                         |

### platform-api-exposure

|             |                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | Name, role, and value must reach the platform accessibility API, not just the DOM.                                                                               |
| 근거        | KWCAG 8.2.1 (**독립 채택** — 트리거 `interactive`·`composite`가 미부착이지만, 위젯 계약 교차검증과 WAI-ARIA가 `progressbar`를 `widget`의 하위 role로 분류한다는 사실을 근거로 채택한다) |
| 이유        | Attributes that never surface in the accessibility tree are invisible to the screen reader that reads that tree, not HTML.                                       |
| 기반 구현체 | 지원 — 관측 트리에 determinate 인스턴스 9개가 전부 `progressbar "<이름>": <값>`으로 노출 (indeterminate 1개는 미노출 — 아래 `indeterminate-omits-valuenow` 참조) |

### state

### value-attributes-reflect-progress

|             |                                                                                                                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 요구사항    | `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` must reflect the current value and its declared range.                                                                                                                                                                         |
| 근거        | WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1 · APG range-related-properties (정보성)                                                                                                                                                                                                              |
| 이유        | A screen reader user cannot tell 15-of-20 from 15-of-100 when the range lives only in the pixel width of the fill.                                                                                                                                                                   |
| 기반 구현체 | 지원 — 관측 c5 `value=15 min=10 max=20` → `aria-valuenow="15" aria-valuemin="10" aria-valuemax="20"`. 값을 안 주면 APG 기본값(min 0 / max 100)을 그대로 렌더한다. APG는 기본 범위일 때 min·max 생략을 허용하지만 base-ui는 항상 쓴다 — 명시가 생략보다 좁은 계약이라 문제되지 않는다 |

### indeterminate-omits-valuenow

|             |                                                                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | When the value is indeterminate, `aria-valuenow` must be omitted rather than set to a placeholder number.                                                                                                                       |
| 근거        | APG range-related-properties (정보성) — "To represent an indeterminate progress bar where the value range is unknown, omit the `aria-valuenow` attribute."                                                                      |
| 이유        | A placeholder `aria-valuenow="0"` tells the user the task has made no progress, which is a claim the app cannot back.                                                                                                           |
| 기반 구현체 | 부분 — 관측 c6 `value={null}` → `aria-valuenow` 부재 + `data-indeterminate`(명세대로). **다만 그 노드가 접근성 스냅샷에 나타나지 않았다** — 인스턴스 10개 중 이것만 빠졌다(2026-08-20 단독 페이지 관측과 동일). 부록 D 6번 참조 |

### value-not-announced-twice

|             |                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The visible value text must not be announced in addition to the widget value.                                                                           |
| 근거        | WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1                                                                                                                         |
| 이유        | Duplicated announcement makes the user hear "40 percent, 40 percent" and doubles the cost of every progress update.                                     |
| 기반 구현체 | 지원 — 관측 `Progress.Value`가 항상 `aria-hidden="true"`로 렌더 (`<span aria-hidden="true">40%</span>`). 소스에서도 무조건 주입이라 소비자가 끌 수 없다 |

### structure

### label-part-associates-name

|             |                                                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | A visible label part must be programmatically associated with the progressbar.                                                                                                                                      |
| 근거        | WCAG 2.2 SC 1.3.1 / KWCAG 5.3.1                                                                                                                                                                                     |
| 이유        | A label that sits next to the bar but is not linked to it leaves the screen reader user with an unnamed progressbar and a floating piece of text.                                                                   |
| 기반 구현체 | 지원 — 관측 인스턴스 10개 전부 `aria-labelledby`가 자기 `Progress.Label`의 `id`로 해석됐다(`getElementById(labelledby).textContent`가 그 인스턴스의 레이블 문구와 일치). `Label`을 생략하면 속성 자체가 붙지 않는다 |

### unique-ids

|             |                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| 요구사항    | Generated ids must be unique across every instance on the page.                                               |
| 근거        | KWCAG 8.1.1                                                                                                   |
| 이유        | A duplicated id makes `aria-labelledby` resolve to the wrong label, so two progress bars share one name.      |
| 기반 구현체 | 지원 — 관측 한 페이지 인스턴스 10개가 `base-ui-_r_0_`~`base-ui-_r_9_`로 전부 고유(중복 0, React `useId` 기반) |

## 2. vapor 자체 구현

base-ui는 unstyled이므로 **시각 축 8건의 컴포넌트 몫은 예외 없이 여기다.** 여기 나머지 7건은
unstyled 때문이 아니라 base-ui `Progress`가 그 계산·검증·현지화를 아예 하지 않기 때문에 여기
있다. 실측 c2~c10이 그 근거이고, **base-ui는 이 중 어느 경우에도 콘솔 경고를 내지 않았다**(카나리
`console.warn`으로 캡처가 살아 있음을 확인한 뒤 관측 — 경고 0건).

### state

### valuenow-within-range

|             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | `aria-valuenow` must always fall within `aria-valuemin` and `aria-valuemax`.                                                                                                                                                                                                                                                                                                                                                                                                      |
| 근거        | WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1 · APG range-related-properties (정보성) — "If the `aria-valuenow` property is set, the author needs to make sure it is within the minimum and maximum values."                                                                                                                                                                                                                                                                                    |
| 이유        | The platform silently clamps an out-of-range value while the fill does not, so a sighted user sees an overflowing or full bar while a screen reader user hears a different number entirely.                                                                                                                                                                                                                                                                                       |
| 기반 구현체 | 미지원 — 기능 없음. 소스가 `aria-valuenow: value ?? undefined`로 클램프 없이 그대로 낸다(같은 패키지 `Meter`는 클램프한다). 관측 c3 `value={150}` → `aria-valuenow="150"`이고 fill 300px/트랙 200px(150%)인데 접근성 트리는 `100`. c4 `value={-30}` → `aria-valuenow="-30"`인데 트리는 `0`, 그러면서 fill은 **트랙을 100% 채운다**(width가 `-30%`라 CSS가 버리고 block 기본 폭이 됨) — 시각과 청각이 정반대다. axe-core도 이 위반을 잡지 않았다(위반 3건 전부 하니스 페이지 수준) |

### declared-range-valid

|             |                                                                                                                                                                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The declared range must be valid — `aria-valuemax` must be greater than `aria-valuemin`.                                                                                                                                                                                                                |
| 근거        | WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1 · WAI-ARIA 1.2 `aria-valuemax` (정보성)                                                                                                                                                                                                                                 |
| 이유        | An inverted or empty range makes the fill and the announced value disagree with no way for either audience to notice the data is wrong.                                                                                                                                                                 |
| 기반 구현체 | 미지원 — 기능 없음. 관측 c7 `min={100} max={0} value={50}` → fill 50%인데 접근성 트리는 `100`, 콘솔 경고 0건. c8 `min={5} max={5} value={5}` → `data-complete`가 붙고 트리는 `5`인데 fill은 **트랙을 100% 채운다**(`valueToPercent`가 0÷0 = NaN을 내 CSS가 버림). Meter에서도 같은 결과였다(2026-08-21) |

### valuetext-only-when-needed

|             |                                                                                                                                                                                                                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | `aria-valuetext` must be set only when `aria-valuenow` is not sufficiently meaningful on its own.                                                                                                                                                                                                   |
| 근거        | WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1 · APG range-related-properties (정보성) — "Only use `aria-valuetext` when `aria-valuenow` is not sufficiently meaningful for users because using `aria-valuetext` will prevent assistive technologies from communicating `aria-valuenow`."                          |
| 이유        | An always-on value text overrides the number the platform already computed correctly, so the user hears the component's guess instead of the platform's clamped, range-aware value.                                                                                                                 |
| 기반 구현체 | 미지원 — 기본값이 반대다. 소스가 `aria-valuetext`를 무조건 계산해 붙이고(`getDefaultAriaValueText`), 관측 c1·c3~c10 전부 속성이 존재했다. **통로는 있다** — c2 `getAriaValueText={() => undefined}`에서 속성이 사라졌다(`hasAttribute` false). 즉 기본값을 뒤집는 것이 vapor의 결정이다. 부록 D 3번 |

### value-text-matches-fill

|             |                                                                                                                                                                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The announced value text must express the same proportion as the indicator fill, for any `min`/`max`.                                                                                                                                                                                                             |
| 근거        | WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1 · APG range-related-properties (정보성) — "For some widgets, assistive technologies use this information to present the current value as a percentage."                                                                                                                           |
| 이유        | A sighted user sees a half-full bar while a screen reader user hears "15 percent", so the two audiences disagree about how far the task has gotten.                                                                                                                                                               |
| 기반 구현체 | 미지원 — 기능 없음. 기본 값 텍스트가 `formatNumberValue(value, locale, undefined)` = `value / 100`을 백분율로 찍어 `min`/`max`를 무시한다. 관측 c5 `value=15 min=10 max=20` → fill 100px/200px(50%)인데 `aria-valuetext="15%"`. 같은 패키지 `Meter`는 `valueToPercent(value, min, max)`로 스케일한다 — 부록 D 1번 |

### value-text-matches-visible

|             |                                                                                                                                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 요구사항    | The announced value text and the visible value text must state the same value in the same unit.                                                                                                                                                                                                                    |
| 근거        | WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1                                                                                                                                                                                                                                                                                    |
| 이유        | A sighted user reading "3%" and a screen reader user hearing "3 of 8 files" cannot compare notes, and neither knows which of the two the app actually meant.                                                                                                                                                       |
| 기반 구현체 | 미지원 — 두 통로가 분리돼 있다. `getAriaValueText`는 Root의 `aria-valuetext`만 바꾸고 `Progress.Value`는 context의 `formattedValue`를 따로 읽는다. 관측 c10 `getAriaValueText={(f,v) => \`${v} of 8 files\`}`→`aria-valuetext="3 of 8 files"`인데 보이는 `Value`는 `"3%"`. vapor가 두 통로를 한 값으로 묶어야 한다 |

### value-text-localized

|             |                                                                                                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | Any value text the component injects itself must be in the language of the page.                                                                                                                                                                                    |
| 근거        | WCAG 2.2 SC 3.1.2 · WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1                                                                                                                                                                                                                 |
| 이유        | A Korean screen reader reads a hardcoded English string with Korean phonetics, so the one state that has no number left to fall back on is also the one the user cannot understand.                                                                                 |
| 기반 구현체 | 미지원 — 기능 없음. 관측 c6 `value={null} locale="ko"`, 페이지 `<html lang="ko">` → `aria-valuetext="indeterminate progress"`. `locale` prop은 `Intl.NumberFormat`에만 쓰이고 이 문구에는 닿지 않는다(소스 `getDefaultAriaValueText`의 하드코딩 리터럴). 부록 D 4번 |

### indeterminate-not-shown-as-complete

|             |                                                                                                                                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The indeterminate state must not render as a full bar.                                                                                                                                                                                   |
| 근거        | WCAG 2.2 SC 1.4.1 / KWCAG 5.4.1 · WCAG 2.2 SC 4.1.2                                                                                                                                                                                      |
| 이유        | A user who sees a completely filled bar stops waiting, and in the indeterminate state there is no announced number to correct them.                                                                                                      |
| 기반 구현체 | 미지원 — 기능 없음. base-ui는 indeterminate에서 Indicator의 인라인 `width`를 아예 주지 않아, 관측 c6에서 Indicator가 트랙을 100% 채웠다(fill 200px / 트랙 200px). `data-indeterminate` 훅은 주므로 폭·애니메이션은 전부 vapor CSS 몫이다 |

### status-not-color-only

|             |                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | Complete, in-progress, and error states must be distinguishable by something other than hue — shape, icon, text, or fill length.                        |
| 근거        | WCAG 2.2 SC 1.4.1 / KWCAG 5.4.1                                                                                                                         |
| 이유        | A user with a color vision deficiency reads a red failed bar and a green finished bar as the same gray bar, and both are full.                          |
| 기반 구현체 | 미지원 — unstyled. 상태 훅은 준다: 관측 `data-progressing` / `data-complete` / `data-indeterminate`가 Root와 모든 파트에 내려온다. error 상태 훅은 없다 |

### indeterminate-motion-reduced

|             |                                                                                                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The indeterminate animation must stop or degrade under `prefers-reduced-motion: reduce`. This is a partial contribution and may not be claimed as the sole basis for the SC 2.2.2 exception. |
| 근거        | WCAG 2.2 SC 2.2.2 / KWCAG 6.2.2 — **부분 기여**. 2.2.2의 충족 기법 목록(G4 · SCR33 · G11 · G152 · SCR22 · G186 · G191)에 `prefers-reduced-motion`은 없다. 면제 경로는 셋뿐이다 — 5초 안 종료 · 유일 콘텐츠 · 프리로드 예외 |
| 이유        | A user with vestibular disorder cannot read the page while a looping bar sweeps in their peripheral vision, and an indeterminate bar loops with no end. The OS setting reduces the harm but does not give the user the pause/stop/hide mechanism the SC asks for. |
| 기반 구현체 | 미지원 — unstyled. base-ui는 `data-indeterminate`만 주고 애니메이션은 그리지 않는다. SC 2.2.2의 「필수적 움직임」 예외가 로딩 표시에 걸릴 여지는 있으나, 예외를 근거로 삼지 않는다 |

### indeterminate-flash-threshold

|             |                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The indeterminate animation must not flash more than three times per second.                                                          |
| 근거        | WCAG 2.2 SC 2.3.1 / KWCAG 6.3.1                                                                                                       |
| 이유        | A photosensitive user can have a seizure from a fast pulsing bar, and an indeterminate bar is on screen for as long as the task runs. |
| 기반 구현체 | 미지원 — unstyled. 애니메이션 자체가 vapor 소유라 주기·대비 진폭 모두 vapor가 정한다                                                  |

### contrast

### indicator-track-contrast

|             |                                                                                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The indicator must have at least 3:1 contrast against the track.                                                                                                                                |
| 근거        | WCAG 2.2 SC 1.4.11 / KWCAG 5.4.4                                                                                                                                                                |
| 이유        | A low-vision user reads progress from where the filled part ends, and cannot find that edge when filled and empty look alike.                                                                   |
| 기반 구현체 | 미지원 — unstyled. base-ui 문서 데모 색은 그쪽 사이트의 CSS Modules 예시라 vapor 기준선이 아니다. Meter 데모에서는 그 예시 트랙이 흰 배경 대비 1.26:1로 미달이었다(2026-08-21) — 베끼면 안 된다 |

### track-adjacent-contrast

|             |                                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The track must be visually distinguishable from the surrounding page background.                                                         |
| 근거        | KWCAG 5.4.4 · WCAG 2.2 SC 1.4.11                                                                                                         |
| 이유        | When the empty part of the track melts into the page, a low-vision user sees a floating colored stripe with no scale to read it against. |
| 기반 구현체 | 미지원 — unstyled                                                                                                                        |

### presentation

### text-resize-200

|             |                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | Label and value text must stay readable and uncut at 200% text zoom.                                                       |
| 근거        | WCAG 2.2 SC 1.4.4                                                                                                          |
| 이유        | A user who enlarges text loses the label entirely if the bar's height is fixed in pixels and clips its own text.           |
| 기반 구현체 | 미지원 — unstyled. Root·Track·Indicator의 높이·폭이 전부 vapor CSS에서 나온다 (관측: Indicator는 `height: inherit`만 쓴다) |

### reflow-320

|             |                                                                                                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The component must work at 320 CSS px width without horizontal scrolling.                                                                                                                     |
| 근거        | WCAG 2.2 SC 1.4.10                                                                                                                                                                            |
| 이유        | A user at 400% zoom on a narrow viewport has to scroll sideways to see the end of the bar, which defeats reading it.                                                                          |
| 기반 구현체 | 미지원 — unstyled. 관측: Root와 Track은 폭을 스스로 정하지 않고 부모 폭을 그대로 쓴다. **Indicator는 예외다** — 트랙을 넘는 폭(c3 300px/200px)을 그대로 내므로 `overflow` 처리도 vapor 몫이다 |

### text-spacing

|             |                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| 요구사항    | No content or function may be lost when the user overrides line height to 1.5× and paragraph spacing to 2×. |
| 근거        | WCAG 2.2 SC 1.4.12                                                                                          |
| 이유        | A dyslexic user's spacing stylesheet pushes the label out of a fixed-height bar and the label disappears.   |
| 기반 구현체 | 미지원 — unstyled                                                                                           |

## 3. 공동(통로)

**이 구획이 곧 prop 설계 목록이다.** vapor가 통로를 뚫어야 소비자가 준수할 수 있다.

### name-description

### accessible-name-slot

|             |                                                                                                                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The component must accept an accessible name through a label part or `aria-label`, and must not render nameless.                                                                                                      |
| 근거        | WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1 · APG range-related-properties (정보성) — 문서의 progressbar 예제 셋 전부가 `aria-labelledby` 또는 `<img alt>`로 이름을 준다                                                          |
| 이유        | A screen reader user hears "progressbar, 40" with no idea what is at 40 — an upload, a quiz, a disk scan.                                                                                                             |
| 기반 구현체 | 슬롯 제공 — `Progress.Label`(자동 `aria-labelledby`) 또는 Root `aria-label` 패스스루. **강제는 안 된다** — 관측: 둘 다 없으면 이름 없는 progressbar가 그대로 렌더되고 axe가 `aria-progressbar-name`(serious)로 잡는다 |
| 짝          | `4. 소비자` / `accessible-name-content`                                                                                                                                                                               |

### visible-label-in-name

|             |                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 요구사항    | The accessible name must contain the text that is presented visually as the label.                                                   |
| 근거        | WCAG 2.2 SC 2.5.3 / KWCAG 6.5.3                                                                                                      |
| 이유        | A speech-input user says the words they can see, and nothing responds when the programmatic name says something else.                |
| 기반 구현체 | 슬롯 제공 — `Progress.Label`. 관측: Label과 `aria-label`을 동시에 주면 `aria-labelledby`가 이겨 계산된 이름이 보이는 텍스트로 남는다 |
| 짝          | `4. 소비자` / `visible-label-consistency`                                                                                            |

### label-slot

|             |                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------- |
| 요구사항    | The component must expose a label slot whose text can describe the specific task in progress. |
| 근거        | WCAG 2.2 SC 2.4.6 / KWCAG 6.4.2                                                               |
| 이유        | "Loading" on five bars at once tells the user nothing about which of the five finished.       |
| 기반 구현체 | 슬롯 제공 — `Progress.Label` (children 자유)                                                  |
| 짝          | `4. 소비자` / `label-content`                                                                 |

### consistent-identification

|             |                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The same progress semantics must carry the same visual and textual identification across the design system.               |
| 근거        | WCAG 2.2 SC 3.2.4                                                                                                         |
| 이유        | A user who learned that a filling blue bar means "working" is misled when the same blue bar means "quota used" elsewhere. |
| 기반 구현체 | 슬롯 제공 — variant·status 어휘를 vapor가 정의하고 소비자가 고른다. 계기(순간값)는 ProgressBar가 아니라 Meter 소관이다    |
| 짝          | `4. 소비자` / `consistent-usage`                                                                                          |

### state

### value-text-slot

|             |                                                                                                                                                                                                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The component must accept a human-readable value string when a percentage is not the meaningful unit.                                                                                                                                                                              |
| 근거        | WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1 · APG range-related-properties (정보성) — `aria-valuetext`는 숫자만으로 부족할 때 쓰는 통로다                                                                                                                                                      |
| 이유        | "62 percent" is useless to a user waiting on "3 of 8 files"; only the app knows which unit the number is in.                                                                                                                                                                       |
| 기반 구현체 | 슬롯 제공 — `getAriaValueText` / `format` / `locale` / `aria-valuetext` 네 통로. 관측 c10 `getAriaValueText`가 `aria-valuetext="3 of 8 files"`로 반영됐다. 단 `format`만 쓰면 단위가 빠진다 — c9 `format={{style:'decimal'}} max={8}` → `aria-valuetext="3"`(최댓값도 단위도 없음) |
| 짝          | `4. 소비자` / `value-text-content`                                                                                                                                                                                                                                                 |

### error-state-slot

|             |                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 요구사항    | The component must expose an error state and a way to link an error message to the progressbar.                                                                    |
| 근거        | WCAG 2.2 SC 3.3.1 / KWCAG 7.3.1                                                                                                                                    |
| 이유        | A failed upload that only turns the bar red leaves a screen reader user believing the task is still running.                                                       |
| 기반 구현체 | 슬롯 제공 — **vapor가 새로 뚫어야 한다.** base-ui `Progress`에는 error 상태도 `aria-describedby` 배선도 없다(관측: 상태는 progressing·complete·indeterminate 셋뿐) |
| 짝          | `4. 소비자` / `error-message-content`                                                                                                                              |

### status-message-slot

|             |                                                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | Completion and failure must be announced without moving focus.                                                                                |
| 근거        | WCAG 2.2 SC 4.1.3 / KWCAG 8.2.1                                                                                                               |
| 이유        | A screen reader user who tabbed away while the upload ran never learns it finished, because a value change on an unfocused widget is silent.  |
| 기반 구현체 | 슬롯 제공 — **vapor가 새로 뚫어야 한다.** 관측: 하니스 인스턴스 10개와 문서 데모 모두 `aria-live`/`role="status"`/`role="alert"` 요소가 0개다 |
| 짝          | `4. 소비자` / `status-message-content`                                                                                                        |

### contrast

### default-token-contrast

|             |                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| 요구사항    | Default label and value text must meet 4.5:1 against their own background (3:1 for large text).          |
| 근거        | WCAG 2.2 SC 1.4.3 / KWCAG 5.4.3                                                                          |
| 이유        | A low-vision user cannot read a percentage rendered in the same light gray as the track behind it.       |
| 기반 구현체 | 슬롯 제공 — 기본 토큰 짝은 vapor가 고정하고, 색 교체 통로(`className`·`style`·`render`)는 base-ui가 준다 |
| 짝          | `4. 소비자` / `custom-color-contrast`                                                                    |

### presentation

### orientation-fluid-width

|             |                                                                                                                                                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The component must not assume a single screen orientation; its width must come from its container.                                                                                                                                 |
| 근거        | WCAG 2.2 SC 1.3.4                                                                                                                                                                                                                  |
| 이유        | A user with a mounted device cannot rotate the screen, so a bar sized for landscape is clipped in portrait.                                                                                                                        |
| 기반 구현체 | 슬롯 제공 — 관측: Root·Track은 자체 폭을 정하지 않고 부모 폭을 그대로 받는다(하니스 200px 트랙이 그대로 반영). Indicator는 `inset-inline-start` + `width`만 써서 논리 속성 기반 좌우 반전은 되지만 **세로 방향은 지원하지 않는다** |
| 짝          | `4. 소비자` / `orientation-no-lock`                                                                                                                                                                                                |

### indeterminate-motion-stop-slot

|             |                                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | The indeterminate bar must be renderable in a non-animated form so a consumer-supplied pause, stop, or hide control has something to act on — without unmounting the `role="progressbar"` node.                                              |
| 근거        | WCAG 2.2 SC 2.2.2 / KWCAG 6.2.2 (원문 3조건: 자동 시작 · 5초 초과 · 병렬 제시). `prefers-reduced-motion`은 충족 기법 목록에 없으므로 `indeterminate-motion-reduced`만으로는 이 통로를 대신하지 못한다                                        |
| 이유        | If the sweep can only be removed by unmounting the bar, a consumer who stops the motion also destroys the node that carries the role and the label, so the task stops being reportable at all. Only the indeterminate loop needs this — a determinate bar advances with the task and is not auto-motion. |
| 기반 구현체 | 슬롯 제공 — 관측: base-ui는 `data-indeterminate`를 Root와 모든 파트에 내려 주고 `className`·`style`·`render` 통로를 열어 둔다. 애니메이션 자체는 base-ui가 그리지 않으므로(unstyled) 끌 대상도 vapor CSS이고, 끄는 스위치를 prop으로 올릴지는 vapor가 정한다 |
| 짝          | `4. 소비자` / `indeterminate-motion-stop-control`                                                                                                                                                                                           |

## 4. 소비자

사용처가 보장할 것. Docs에 그대로 옮길 수 있는 문장으로 쓴다.

### name-description

### accessible-name-content

|             |                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------- |
| 요구사항    | The consumer must always give the progressbar a name, via the label part or `aria-label`. |
| 근거        | WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1                                                           |
| 이유        | An unnamed progressbar announces a bare number and the user cannot tell what it measures. |
| 기반 구현체 | 해당 없음                                                                                 |
| 짝          | `3. 공동(통로)` / `accessible-name-slot`                                                  |

### visible-label-consistency

|             |                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------- |
| 요구사항    | When using `aria-label` alongside visible text, the consumer must keep the visible words inside it. |
| 근거        | WCAG 2.2 SC 2.5.3 / KWCAG 6.5.3                                                                     |
| 이유        | A speech-input user's command matches the visible words, not the hidden ones.                       |
| 기반 구현체 | 해당 없음                                                                                           |
| 짝          | `3. 공동(통로)` / `visible-label-in-name`                                                           |

### label-content

|             |                                                                                        |
| ----------- | -------------------------------------------------------------------------------------- |
| 요구사항    | The consumer must write a label that names the task, not the widget.                   |
| 근거        | WCAG 2.2 SC 2.4.6 / KWCAG 6.4.2                                                        |
| 이유        | "Progress" as a label repeats the role and adds nothing the user did not already hear. |
| 기반 구현체 | 해당 없음                                                                              |
| 짝          | `3. 공동(통로)` / `label-slot`                                                         |

### consistent-usage

|             |                                                                                        |
| ----------- | -------------------------------------------------------------------------------------- |
| 요구사항    | The consumer must use ProgressBar for task completion only, not for gauges or ratings. |
| 근거        | WCAG 2.2 SC 3.2.4                                                                      |
| 이유        | A user hears "progressbar" and waits for it to finish; a disk-usage gauge never will.  |
| 기반 구현체 | 해당 없음                                                                              |
| 짝          | `3. 공동(통로)` / `consistent-identification`                                          |

### state

### value-text-content

|             |                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------- |
| 요구사항    | The consumer must supply a value string in the unit that matters when percentage is not meaningful. |
| 근거        | WCAG 2.2 SC 4.1.2 / KWCAG 8.2.1                                                                     |
| 이유        | Only the app knows whether the number counts files, bytes, or steps.                                |
| 기반 구현체 | 해당 없음                                                                                           |
| 짝          | `3. 공동(통로)` / `value-text-slot`                                                                 |

### error-message-content

|             |                                                                               |
| ----------- | ----------------------------------------------------------------------------- |
| 요구사항    | The consumer must provide an error message that names what failed, in text.   |
| 근거        | WCAG 2.2 SC 3.3.1 / KWCAG 7.3.1                                               |
| 이유        | A red bar with no words leaves the user knowing something broke but not what. |
| 기반 구현체 | 해당 없음                                                                     |
| 짝          | `3. 공동(통로)` / `error-state-slot`                                          |

### error-suggestion

|             |                                                                                        |
| ----------- | -------------------------------------------------------------------------------------- |
| 요구사항    | The consumer must suggest how to recover when the cause of the failure is known.       |
| 근거        | WCAG 2.2 SC 3.3.3 / KWCAG 7.3.1                                                        |
| 이유        | "Upload failed" without "retry" or "file too large" leaves the user with no next move. |
| 기반 구현체 | 해당 없음                                                                              |

### status-message-content

|             |                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| 요구사항    | The consumer must announce completion and failure once, and must not announce every intermediate tick. |
| 근거        | WCAG 2.2 SC 4.1.3 / KWCAG 8.2.1                                                                        |
| 이유        | A live region that fires on every percent floods the screen reader and drowns out the page.            |
| 기반 구현체 | 해당 없음                                                                                              |
| 짝          | `3. 공동(통로)` / `status-message-slot`                                                                |

### contrast

### custom-color-contrast

|             |                                                                                         |
| ----------- | --------------------------------------------------------------------------------------- |
| 요구사항    | The consumer must keep 4.5:1 for text and 3:1 for the indicator when overriding colors. |
| 근거        | WCAG 2.2 SC 1.4.3 / 1.4.11 / KWCAG 5.4.3 / 5.4.4                                        |
| 이유        | A brand-colored bar on a brand-colored background is invisible to a low-vision user.    |
| 기반 구현체 | 해당 없음                                                                               |
| 짝          | `3. 공동(통로)` / `default-token-contrast`                                              |

### presentation

### orientation-no-lock

|             |                                                                             |
| ----------- | --------------------------------------------------------------------------- |
| 요구사항    | The consumer must not lock the page to a single orientation to fit the bar. |
| 근거        | WCAG 2.2 SC 1.3.4                                                           |
| 이유        | A user whose device is fixed in a mount cannot rotate to match.             |
| 기반 구현체 | 해당 없음                                                                   |
| 짝          | `3. 공동(통로)` / `orientation-fluid-width`                                 |

### indeterminate-motion-stop-control

|             |                                                                                                                                                                                                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 요구사항    | When an indeterminate bar runs longer than five seconds in parallel with other content, the consumer must supply a mechanism to pause, stop, or hide it — unless the bar is the only content on screen, or interaction is blocked for all users during that phase.                  |
| 근거        | WCAG 2.2 SC 2.2.2 / KWCAG 6.2.2 (원문 3조건) · Understanding 2.2.2 (정보성 — 프리로드 예외 "interaction cannot occur during that phase for all users")                                                                                                                             |
| 이유        | A looping sweep beside readable content makes the page unusable for users with attention or vestibular disorders, and only the consumer knows how long the task runs and what else is on screen. A determinate bar is exempt by construction — its movement tracks the task, not a loop. |
| 기반 구현체 | 해당 없음                                                                                                                                                                                                                                                                          |
| 짝          | `3. 공동(통로)` / `indeterminate-motion-stop-slot`                                                                                                                                                                                                                                 |

### sensory-instructions

|             |                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------ |
| 요구사항    | The consumer must not write instructions that rely on the bar's color, shape, or position alone. |
| 근거        | WCAG 2.2 SC 1.3.3 / KWCAG 5.3.3                                                                  |
| 이유        | "Wait until the bar turns green" is unusable to a user who never sees the bar.                   |
| 기반 구현체 | 해당 없음                                                                                        |

### language-of-parts

|             |                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------- |
| 요구사항    | The consumer must mark label or value text whose language differs from the page.              |
| 근거        | WCAG 2.2 SC 3.1.2                                                                             |
| 이유        | A Korean screen reader reads an English label with Korean phonetics and it is unintelligible. |
| 기반 구현체 | 해당 없음                                                                                     |

### audio-control

|             |                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| 요구사항    | If the consumer pairs progress with sound that plays for more than 3 seconds, it must be controllable. |
| 근거        | WCAG 2.2 SC 1.4.2 / KWCAG 5.4.2                                                                        |
| 이유        | A screen reader user cannot hear their own speech output over an uncontrollable progress sound.        |
| 기반 구현체 | 해당 없음                                                                                              |

## 부록 A. 성질

`properties.md` 23개 전수 판정 결과. 붙은 것 7개. APG practices 문서를 읽어도 태그는 바뀌지
않았다 — APG range widget 중 포커스를 받는 것은 slider·spinbutton·focusable separator뿐이고
progressbar는 그 목록에 없어 `interactive` X가 재확인됐다.

| 태그             | 붙음 | 근거                                                                                      |
| ---------------- | ---- | ----------------------------------------------------------------------------------------- |
| `interactive`    | X    | 탭 정지점이 없고 값을 바꿀 수단이 없다 — 읽기 전용 위젯이다                               |
| `composite`      | X    | 파트는 5개지만 관리할 자식 항목이 없다. roving tabindex도 화살표 이동도 없다              |
| `text`           | O    | `Label`·`Value`가 글자를 직접 렌더한다                                                    |
| `icon`           | X    | 아이콘·이미지 파트가 없다. Indicator는 이미지가 아니라 role이 붙은 위젯의 값 표현이다     |
| `visible-label`  | O    | `Progress.Label`이 보이는 텍스트 레이블이다                                               |
| `form-control`   | X    | 값을 갖지만 `name`이 없고 폼에 제출되지 않는다                                            |
| `text-input`     | X    | 자유 텍스트를 받지 않는다                                                                 |
| `validatable`    | O    | 실패한 작업(업로드 실패 등)의 error 상태를 지원하기로 확정 — 2026-08-20 사용자 결정       |
| `state-visual`   | O    | 진행 중·완료·indeterminate·error를 시각 신호로만 구분한다                                 |
| `ui-boundary`    | O    | Track이 배경·테두리로 자기 경계를 그린다. 빈 구간이 안 보이면 진행률도 못 읽는다          |
| `overlay`        | X    | 인라인 고정. Portal을 쓰지 않는다                                                         |
| `transient`      | X    | 포인터·포커스로 떴다 사라지지 않는다                                                      |
| `modal`          | X    | 배경을 차단하지 않는다                                                                    |
| `auto-dismiss`   | X    | 타이머로 사라지지 않는다. 완료 후 소멸은 소비자의 렌더 결정이다                           |
| `auto-motion`    | O    | indeterminate는 사용자가 시작하지 않은 무한 애니메이션이고, 작업이 5초를 넘기면 계속 돈다 |
| `pointer-target` | X    | 누를 대상이 없다                                                                          |
| `gesture`        | X    | 드래그·스와이프·핀치가 없다. Slider와 갈리는 지점이다                                     |
| `device-motion`  | X    | 가속도계·자이로를 쓰지 않는다                                                             |
| `char-shortcut`  | X    | 키 바인딩 자체가 없다                                                                     |
| `status-message` | O    | 완료·실패를 포커스 이동 없이 알려야 한다                                                  |
| `link`           | X    | 이동시키지 않는다                                                                         |
| `table`          | X    | 행·열 구조가 없다                                                                         |
| `media`          | X    | 시간 기반 미디어가 아니다                                                                 |

## 부록 B. 위젯 계약

출처 (1차): APG 「Communicating Value and Limits for Range Widgets」
<https://www.w3.org/WAI/ARIA/apg/practices/range-related-properties/> — `progressbar`를 range
widget으로 명시하고 `Range properties with progress bars` 절을 둔다. **APG 30개 패턴에
progressbar 패턴은 없다**(`/patterns/progress/`·`/patterns/progressbar/` 모두 404, 2026-08-21
확인) — 계약은 이 practices 문서가 소유한다.

출처 (보조): MDN
<https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role>

APG가 정의한 range widget 표에서 progressbar 행:

| 역할        | `aria-valuemin` 기본 | `aria-valuemax` 기본 | min 필수 | max 필수 | now 필수 |
| ----------- | -------------------- | -------------------- | -------- | -------- | -------- |
| progressbar | 0                    | 100                  | No       | No       | **No**   |

`aria-valuenow`가 필수가 아닌 range widget은 progressbar와 spinbutton 둘뿐이다 — indeterminate가
있기 때문이다.

| 칸               | 내용                                                                                                                                                                                                                                                             | 요구사항 슬러그                                                                                                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| role             | Root = `progressbar` (APG range widget 6종 중 하나). Track·Indicator·Label·Value는 역할 없음(표현)                                                                                                                                                               | `progressbar-role` `platform-api-exposure`                                                                                                                                                                      |
| 상태             | indeterminate = `aria-valuenow` **생략**. `aria-busy`(MDN 선택 — 로딩 중인 영역 쪽 속성)                                                                                                                                                                         | `indeterminate-omits-valuenow` `indeterminate-not-shown-as-complete`                                                                                                                                            |
| 속성             | `aria-valuenow` — 값이 알려져 있으면 설정하고 **min~max 안에 있어야 한다** · `aria-valuemin` 기본 0 · `aria-valuemax` 기본 100(기본 범위면 둘 다 생략 가능) · `aria-valuetext` — **valuenow가 충분히 의미 있지 않을 때만.** 쓰면 AT가 valuenow를 발화하지 않는다 | `value-attributes-reflect-progress` `valuenow-within-range` `declared-range-valid` `valuetext-only-when-needed` `value-text-slot` `value-text-matches-fill` `value-text-matches-visible` `value-text-localized` |
| 키 인터랙션      | **없음** — APG가 포커스 가능하다고 적은 range widget은 slider·spinbutton·focusable separator뿐이다. progressbar에는 키보드 절이 없다                                                                                                                             | (없음 — 요구사항으로 번역되지 않는다. 2.1.1이 제외인 근거다)                                                                                                                                                    |
| 포커스 관리 규칙 | **없음** — 포커스를 받지 않는다                                                                                                                                                                                                                                  | (없음 — 2.4.3·2.4.7·2.4.11이 제외인 근거다)                                                                                                                                                                     |
| 접근 가능 이름   | **필수**. APG 예제 셋 모두 이름을 준다 — SVG 버전은 `aria-labelledby="loadlabel"`, 네이티브 버전은 `<label for>`, indeterminate 버전은 `<img role="progressbar" alt="Loading...">`                                                                               | `accessible-name-slot` `label-part-associates-name` `visible-label-in-name`                                                                                                                                     |

계약에서 옮기지 않은 것 둘:

- **`aria-busy`** — MDN이 "권장"으로 쓰고 되받을 SC가 없다. 로딩 중인 **영역** 쪽 속성이지
  ProgressBar 자신의 속성이 아니어서 소비자 문서에 남길 사안이다.
- **기본 범위일 때 min·max 생략 허용** — 생략해도 된다는 허용은 요구사항이 아니다. base-ui는
  항상 쓰고, 명시가 생략보다 좁은 계약이라 위반이 아니다.

## 부록 C. 제외 — 이 컴포넌트에 걸리지 않는 SC

누락이 아니라 판단이다. 총 37건.

| SC          | 제목                         | 사유                                                                                             |
| ----------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| 1.1.1       | 비텍스트 콘텐츠              | `icon`·`media` 미해당. Indicator는 이미지가 아니라 role이 붙은 값 표현이라 4.1.2·1.4.11이 받는다 |
| 1.2.1       | 오디오/비디오만 (녹화)       | `media` 미해당                                                                                   |
| 1.2.2       | 자막 (녹화)                  | `media` 미해당                                                                                   |
| 1.2.3       | 음성 해설 또는 대체          | `media` 미해당                                                                                   |
| 1.2.4       | 자막 (실시간)                | `media` 미해당                                                                                   |
| 1.2.5       | 음성 해설 (녹화)             | `media` 미해당                                                                                   |
| 1.3.2       | 의미 있는 순서               | `overlay`·`composite` 미해당. Portal을 쓰지 않아 DOM 순서와 읽기 순서가 어긋날 지점이 없다       |
| 1.3.5       | 입력 목적 식별               | `text-input` 미해당. 사용자 입력을 받지 않는다                                                   |
| 1.4.5       | 이미지 내 텍스트             | `icon` 미해당                                                                                    |
| 1.4.13      | 호버·포커스 콘텐츠           | `transient` 미해당. 호버로 뜨는 콘텐츠가 없다                                                    |
| 2.1.1       | 키보드                       | `interactive`·`composite`·`gesture` 미해당. 위젯 계약의 키 인터랙션 칸이 비어 있다               |
| 2.1.2       | 키보드 트랩 없음             | `modal`·`overlay` 미해당. 포커스를 가두지 않는다                                                 |
| 2.1.4       | 문자 키 단축키               | `char-shortcut` 미해당                                                                           |
| 2.2.1       | 시간 조절                    | `auto-dismiss` 미해당. 타이머로 사라지지 않는다 — 진행 애니메이션은 2.2.2가 받는다               |
| 2.4.1       | 블록 건너뛰기                | 페이지 수준                                                                                      |
| 2.4.2       | 페이지 제목                  | 페이지 수준                                                                                      |
| 2.4.3       | 초점 순서                    | `interactive`·`overlay`·`composite` 미해당. 포커스를 받지 않는다                                 |
| 2.4.4       | 링크 목적 (문맥 내)          | `link` 미해당                                                                                    |
| 2.4.5       | 여러 가지 방법               | 사이트 수준                                                                                      |
| 2.4.7       | 초점 표시                    | `interactive` 미해당. 포커스 링을 그릴 대상이 없다                                               |
| 2.4.11      | 초점 가려지지 않음 (최소)    | `overlay`·`modal`·`auto-dismiss` 미해당. 떠 있는 레이어가 아니다                                 |
| 2.5.1       | 포인터 제스처                | `gesture` 미해당                                                                                 |
| 2.5.2       | 포인터 취소                  | `pointer-target` 미해당. 누를 대상이 없다                                                        |
| 2.5.4       | 동작 기반 작동               | `device-motion` 미해당                                                                           |
| 2.5.7       | 끌기 동작                    | `gesture` 미해당. Slider와 갈리는 지점이다                                                       |
| 2.5.8       | 타깃 크기 (최소)             | `pointer-target` 미해당. 24×24를 요구할 히트 영역이 없다                                         |
| 3.1.1       | 페이지의 언어                | 페이지 수준                                                                                      |
| 3.2.1       | 포커스 시                    | `interactive` 미해당. 포커스를 받지 않아 맥락 변화 지점이 없다                                   |
| 3.2.2       | 입력 시                      | `form-control` 미해당. 사용자 입력이 없다                                                        |
| 3.2.3       | 일관된 내비게이션            | 사이트 수준                                                                                      |
| 3.2.6       | 일관된 도움                  | 사이트 수준                                                                                      |
| 3.3.2       | 레이블 또는 설명             | `form-control` 미해당. 이름 요구는 4.1.2가, 문구 품질은 2.4.6이 받는다                           |
| 3.3.4       | 오류 방지 (법률·금융·데이터) | 플로우 수준                                                                                      |
| 3.3.7       | 반복 입력                    | `text-input` 미해당                                                                              |
| 3.3.8       | 접근 가능한 인증 (최소)      | `text-input` 미해당                                                                              |
| KWCAG 6.4.4 | 고정된 참조 위치 정보        | 전자출판 문서 한정                                                                               |
| KWCAG 7.2.2 | 찾기 쉬운 도움 정보          | 사이트 수준                                                                                      |

## 부록 D. 설계 결정

답이 아니라 질문이다. 이 문서는 결정하지 않는다. 12건 중 **구현 전 답이 필요한 것은 1~4번**이다
— 넷 다 값 계약이라 API 형태를 정한다.

1. **`min`/`max`를 열 것인가** — base-ui `Progress`의 기본 `aria-valuetext`는 `value/100`을
   백분율로 찍고 `min`/`max`를 반영하지 않는다(관측 c5: `value=15 min=10 max=20` → fill 50%,
   텍스트 "15%"). 같은 패키지의 `Meter`는 `valueToPercent(value, min, max)`로 계산한다. 셋 중
   하나다 — (a) `min`/`max`를 API에서 막고 0~100으로 고정, (b) 열되 vapor가
   `getAriaValueText` 기본값을 씌워 보정, (c) 상류에 고치고 기다린다. **초판에서 (a) 쪽으로
   기울었던 근거가 약해졌다** — APG는 range widget에 min/max를 두는 것을 전제로 쓰고 "AT가 이
   정보로 값을 백분율로 환산한다"고 명시하므로, 막는 쪽이 규범 의도와 어긋난다.
2. **범위 유효성 가드를 어디에 둘 것인가** — APG는 "the author needs to make sure it is within
   the minimum and maximum values"라고 저자에게 맡기는데 base-ui는 클램프도 경고도 하지 않고
   axe도 못 잡는다(관측 c3·c4·c7·c8, 콘솔 경고 0건). 셋 중 하나다 — (a) 런타임 클램프(AT와
   fill이 항상 일치하지만 데이터 오류가 조용히 삼켜진다), (b) 개발 빌드 경고만(오류가 보이지만
   프로덕션에서는 여전히 갈린다), (c) 타입으로 막기(`min`/`max`를 안 열면 1번과 묶여 닫힌다).
   **c4가 가장 나쁘다** — `value={-30}`이 AT에는 0, 화면에는 100% 채운 바로 나온다.
3. **`aria-valuetext`를 기본으로 끌 것인가** — APG는 valuenow가 충분히 의미 있으면 valuetext를
   쓰지 말라고 하고(valuetext가 valuenow 발화를 막으므로) base-ui 기본값은 항상 켠다. 통로는
   있다(관측 c2: `getAriaValueText={() => undefined}` → 속성 소멸). vapor가 기본을 뒤집으면
   플랫폼이 계산한 클램프된 값이 발화되므로 1·2번이 함께 완화된다. 뒤집지 않으면 vapor가
   valuetext의 정확성을 끝까지 책임져야 한다.
4. **indeterminate 값 텍스트를 누가 번역하나** — base-ui는 `locale`과 무관하게
   `aria-valuetext="indeterminate progress"`를 하드코딩한다(관측 c6, 페이지 `lang="ko"`).
   vapor가 기본 한국어 문구를 씌울지, 소비자에게 필수로 넘길지, 상류에 이슈를 낼지.
5. **error 상태를 어디에 둘 것인가** — `role="progressbar"`에는 invalid 개념이 없다.
   `aria-invalid`는 이 role에서 지원 속성이 아니므로 오류는 텍스트 + `aria-describedby` +
   상태 메시지로만 전달된다. ProgressBar가 직접 소유할지, Field 계층으로 올릴지가 갈린다.
6. **indeterminate 노출을 스크린리더로 확인해야 한다** — `value={null}`일 때 base-ui는 명세대로
   `aria-valuenow`를 생략하는데, 그 상태의 노드가 Playwright 계열 접근성 스냅샷에 나타나지
   않았다(2026-08-20 단독 페이지, 2026-08-21 인스턴스 10개 중 이것만 누락으로 재확인).
   `aria-valuenow="0"`을 수동으로 붙이면 즉시 노출된다. 스냅샷 직렬화기의 한계일 가능성이 크지만
   관측만으로는 못 가르므로 `indeterminate-omits-valuenow`를 `부분`으로 남겼다. VoiceOver·NVDA
   실사용 확인이 이 판정을 확정 또는 반증한다.
7. **완료 알림 라이브 리전을 누가 소유하나** — base-ui는 라이브 리전을 하나도 만들지 않는다.
   ProgressBar마다 하나씩 만들면 화면에 5개면 리전도 5개가 된다. 컴포넌트가 옵트인 prop으로
   소유할지, 페이지가 하나를 갖고 소비자가 문구를 밀어 넣을지.
8. **이름을 강제할 것인가** — base-ui는 이름 없는 progressbar를 그대로 렌더한다(axe
   `aria-progressbar-name`, serious). 타입 수준에서 `Label` 또는 `aria-label` 중 하나를 강제할지,
   개발 빌드 경고로 그칠지.
9. **세로 방향을 지원할 것인가** — base-ui Indicator는 `inset-inline-start` + `width`만 쓴다.
   세로 ProgressBar는 base-ui가 주지 않으므로 전부 vapor CSS다.
10. **완료 시 아이콘을 넣을 것인가** — 지금은 `icon`을 X로 뒀고 그것이 1.1.1·1.4.5를 제외한
    근거다. 체크 아이콘을 넣기로 하면 두 SC가 부활하고 요구사항 2건이 추가된다.
11. **4.1.2를 트리거 없이 채택한 근거는 WAI-ARIA의 role 상위 분류다** — 4.1.2(이름·역할·값)와
    KWCAG 8.2.1의 `sc-map.md` 트리거는 `interactive` `form-control` `composite` 셋인데
    ProgressBar는 어느 것도 아니다. `role="progressbar"` + `aria-valuenow`가 이 컴포넌트의 가장
    중요한 요구사항인데 트리거로는 잡히지 않아, 위젯 계약과의 교차검증으로 채택했다. 그 채택을
    받치는 규범은 **WAI-ARIA 1.2의 role 상위 분류**다 — `progressbar`는 `widget`의 하위 role이고
    4.1.2는 "user interface components"를 대상으로 하므로, 성질 태그가 안 붙어도 규범 자체가
    이 role을 UI 컴포넌트로 분류한다. 같은 기준으로 `meter`는 `range`의 하위, `status`는
    `section`의 하위여서 Meter·Spinner가 4.1.2를 제외한 것도 정당하다. **따라서 이것은 판정
    어휘의 구멍이 아니고, `sc-map.md`에 `value-widget` 태그를 신설할 필요도 없다** — 초판이
    예고한 "다음 컴포넌트에서 같은 구멍이 재발한다"는 전망은 철회한다(2026-08-25). 남는 것은
    이 상위 분류 근거를 `sc-map.md`의 4.1.2 행 비고로 옮겨 적을지뿐이다.
12. **네이티브 `<progress>`를 쓰지 않는 이유를 문서화할 것인가** — APG는 SVG 버전과 나란히
    `<progress max="100" value="33">`을 동등 대안으로 제시한다. base-ui는 `div` +
    `role="progressbar"`를 쓴다. 네이티브를 택하면 위 1~4번(범위 클램프·valuetext 기본값·문구
    현지화)이 전부 브라우저 몫으로 넘어가지만 Indicator·Track 파트 조합과 스타일링을 잃는다.
    결정 자체는 base-ui 채택으로 이미 끝났으므로 남는 것은 근거를 ADR로 남길지다.

## 출처

- WCAG 2.2 <https://www.w3.org/TR/WCAG22/>
- 한국형 웹 콘텐츠 접근성 지침 2.2 (KS X OT0003)
- APG 「Communicating Value and Limits for Range Widgets」
  <https://www.w3.org/WAI/ARIA/apg/practices/range-related-properties/> — 정보성. **위젯 계약의
  1차 출처**
- W3C ARIA APG 패턴 목록 <https://www.w3.org/WAI/ARIA/apg/patterns/> — progressbar **패턴**이
  없음을 확인한 출처(30개 목록 + `/patterns/progress/`·`/patterns/progressbar/` 404, 2026-08-21)
- MDN `role=progressbar` <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role> — 정보성, 보조 출처
- base-ui `Progress` <https://base-ui.com/react/components/progress> — 실측 대상
- 참고: base-ui `Meter`(`@base-ui/react@1.6.0`)는 값 텍스트를 `min`/`max`로 스케일하고
`aria-valuenow`를 클램프한다. 같은 패키지 안에서 두 컴포넌트의 처리가 갈린다는 사실이 부록 D
1·2번의 근거다. 위임 판정의 증거는 아니다
  </content>

</invoke>
