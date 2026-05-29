# Vapor UI Token Reference

> **token-qa의 유일한 참조 파일.** 모든 토큰의 이름·의도(`when`)·금지 컨텍스트(`avoid`)·픽셀 값·light 모드 해소값을 한 파일에 담는다. Python 등 외부 파서 없이 Read 한 번으로 검사·추천 모두 가능.
>
> **포맷 규칙** — `when`/`avoid` 메타데이터가 있는 토큰은 모두 `$css Token | CSS Variable | When | Avoid` 4열 테이블. 단순 key→값 매핑은 인라인 리스트. light 모드 해소값은 끝부분 별도 섹션.
>
> **토큰 사용 방식 2가지:**
>
> - **`$css` prop** (JSX): `$css={{ background: '$bg-primary-100' }}`
> - **CSS 직접 참조**: `var(--vapor-color-background-primary-100)`
>
> **이름 변환 규칙**: `$bg-{name}` → `--vapor-color-background-{name}` · `$fg-{name}` → `--vapor-color-foreground-{name}` · `$border-{name}` → `--vapor-color-border-{name}`

---

## Semantic Backgrounds

> `$css` prop: `$css={{ background: '$bg-{name}' }}` · CSS 직접: `var(--vapor-color-background-{name})`

| `$css` Token        | CSS Variable                             | When | Avoid |
| ------------------- | ---------------------------------------- | ---- | ----- |
| `$bg-primary-100` | `--vapor-color-background-primary-100` | background of element visually indicating current selection or active state with brand color, non-interactive label showing status or category, primary feedback or notification message background | page or screen background → colors.background.canvas.100, solid action elements background → colors.background.primary.200, disabled states → apply 32% opacity to this token |
| `$bg-primary-200` | `--vapor-color-background-primary-200` | solid fill background for interactive action elements (Button, Checkbox, Radio, Switch), brand color fill for non-interactive visual elements (Avatar, Spinner) | page or screen background → colors.background.canvas.100, non-interactive status or category label background → colors.background.primary.100, disabled states → apply 32% opacity to this token |
| `$bg-secondary-100` | `--vapor-color-background-secondary-100` | Inactive tab backgrounds, Neutral badge backgrounds | — |
| `$bg-secondary-200` | `--vapor-color-background-secondary-200` | Hover state secondary buttons, Pressed state surfaces | — |
| `$bg-success-100` | `--vapor-color-background-success-100` | Success notification backgrounds, Completed state badges | — |
| `$bg-success-200` | `--vapor-color-background-success-200` | Filled success button backgrounds, Progress completion indicators | — |
| `$bg-warning-100` | `--vapor-color-background-warning-100` | Warning banner backgrounds, Caution badges | — |
| `$bg-warning-200` | `--vapor-color-background-warning-200` | Filled warning button backgrounds | — |
| `$bg-danger-100` | `--vapor-color-background-danger-100` | Error notification backgrounds, Destructive action confirmation areas | — |
| `$bg-danger-200` | `--vapor-color-background-danger-200` | Destructive action button backgrounds | — |
| `$bg-hint-100` | `--vapor-color-background-hint-100` | Tooltip backgrounds, Inline help areas | — |
| `$bg-hint-200` | `--vapor-color-background-hint-200` | Dark tooltip backgrounds | — |
| `$bg-contrast-100` | `--vapor-color-background-contrast-100` | callout background for critical information that requires strong visual emphasis, non-interactive component background that needs contrast distinction from the page background | interactive elements with contrast type background → colors.background.contrast.200 |
| `$bg-contrast-200` | `--vapor-color-background-contrast-200` | solid action element requiring high contrast against the page background, feedback or notification component background that must be visually distinct from surrounding content, contextual helper or tooltip background requiring clear separation from the UI | secondary type button background → colors.background.secondary.200 |
| `$bg-canvas-100` | `--vapor-color-background-canvas-100` | default background of all pages or screens, base surface background for components with visible borders | elevated surfaces such as sidebar or panel background → colors.background.canvas.200, backgrounds for the most visually prominent components on the screen → colors.background.primary |
| `$bg-canvas-200` | `--vapor-color-background-canvas-200` | secondary page-level background area that needs visual separation from the primary canvas, layout region requiring a subtle distinction between background layers without component-level context | direct use as a component background → colors.background.secondary.100, primary page background → colors.background.canvas.100 |
| `$bg-overlay-100` | `--vapor-color-background-overlay-100` | Modal overlays, Drawer dim backgrounds | Content-bearing surfaces → colors.background.canvas |

---

## Semantic Foregrounds

> `$css` prop: `$css={{ color: '$fg-{name}' }}` · CSS 직접: `var(--vapor-color-foreground-{name})`

| `$css` Token        | CSS Variable                             | When | Avoid |
| ------------------- | ---------------------------------------- | ---- | ----- |
| `$fg-primary-100` | `--vapor-color-foreground-primary-100` | brand-colored text or icon on white or transparent background, subtle brand emphasis without a colored background | use on canvas.200 or surfaces with non-white background color → colors.foreground.primary.200 |
| `$fg-primary-200` | `--vapor-color-foreground-primary-200` | brand-colored text or icon on canvas.200 or a surface with non-white background color, strong brand emphasis on a colored background surface | use on white or transparent background → colors.foreground.primary.100 |
| `$fg-secondary-100` | `--vapor-color-foreground-secondary-100` | Captions, Sub-labels, Metadata text | Primary body text → colors.foreground.normal |
| `$fg-secondary-200` | `--vapor-color-foreground-secondary-200` | Emphasized captions, Secondary headings | — |
| `$fg-success-100` | `--vapor-color-foreground-success-100` | Success message text, Completion state labels | — |
| `$fg-success-200` | `--vapor-color-foreground-success-200` | Hover state success text | — |
| `$fg-warning-100` | `--vapor-color-foreground-warning-100` | Warning message text, Caution labels | — |
| `$fg-warning-200` | `--vapor-color-foreground-warning-200` | Hover state warning text | — |
| `$fg-danger-100` | `--vapor-color-foreground-danger-100` | text or icon indicating a destructive or irreversible action such as deletion, error message text or icon requiring user attention | cautionary actions that do not involve danger → colors.foreground.warning.100 |
| `$fg-danger-200` | `--vapor-color-foreground-danger-200` | Hover state error text | — |
| `$fg-hint-100` | `--vapor-color-foreground-hint-100` | Placeholder text, Field helper text | — |
| `$fg-hint-200` | `--vapor-color-foreground-hint-200` | Emphasized helper text | — |
| `$fg-contrast-100` | `--vapor-color-foreground-contrast-100` | Emphasized headings, Code text | — |
| `$fg-contrast-200` | `--vapor-color-foreground-contrast-200` | Top-level headings, Critical emphasis text | — |
| `$fg-normal-100` | `--vapor-color-foreground-normal-100` | <p> and <li> body text, General UI labels | Captions and supporting text → colors.foreground.secondary, Hyperlinks → colors.foreground.primary |
| `$fg-normal-200` | `--vapor-color-foreground-normal-200` | Primary body paragraphs, High-readability labels | — |
| `$fg-inverse` | `--vapor-color-foreground-inverse` | text or icon on backgrounds where white provides sufficient contrast against the background color | light or pale backgrounds where dark text provides better readability → use contextual foreground tokens |

---

## Semantic Borders

> `$css` prop: `$css={{ borderColor: '$border-{name}' }}` · CSS 직접: `var(--vapor-color-border-{name})`

| `$css` Token        | CSS Variable                             | When | Avoid |
| ------------------- | ---------------------------------------- | ---- | ----- |
| `$border-normal` | `--vapor-color-border-normal` | Card and sheet outlines, Input field default borders, Dividers | Focus indicators → focusIndicator token, Error states → colors.border.danger |
| `$border-primary` | `--vapor-color-border-primary` | Selected input fields, Active tab underlines, Selected card outlines | — |
| `$border-secondary` | `--vapor-color-border-secondary` | Table cell separators, Section dividers | — |
| `$border-success` | `--vapor-color-border-success` | Validated input field outlines, Success state cards | — |
| `$border-warning` | `--vapor-color-border-warning` | Warning banner outlines, Caution state inputs | — |
| `$border-danger` | `--vapor-color-border-danger` | Invalid input field outlines, Error state cards | General separators → colors.border.normal |
| `$border-hint` | `--vapor-color-border-hint` | Tooltip outlines, Help box outlines | — |
| `$border-contrast` | `--vapor-color-border-contrast` | Emphasized card outlines, High-contrast dividers | — |

---

## Size Primitives

키 이름은 같아도 **카테고리마다 픽셀 매핑이 다르다.** `$200`은 space에서는 16px, borderRadius에서는 6px이다. 적용될 CSS 속성에 맞춰 해당 카테고리를 선택한다.

**Space** — `padding`, `margin`, `gap` (음수는 `-$200` 형태)
`000=0` · `025=2` · `050=4` · `075=6` · `100=8` · `150=12` · `175=14` · `200=16` · `225=18` · `250=20` · `300=24` · `400=32` · `500=40` · `600=48` · `700=56` · `800=64` · `900=72` (px)

**Dimension** — `width`, `height`
`025=2` · `050=4` · `075=6` · `100=8` · `150=12` · `175=14` · `200=16` · `225=18` · `250=20` · `300=24` · `400=32` · `500=40` · `600=48` · `700=56` · `800=64` (px)

**BorderRadius** — `borderRadius`
`000=0` · `050=2` · `100=4` · `200=6` · `300=8` · `400=12` · `500=16` · `600=20` · `700=24` · `800=32` · `900=40` (px)

> 관용 예외: `9999px`(pill), `50%`(circle), `0`/`0px`(zero), `1px`(hairline) 허용.

---

## Typography Composite — `<Text typography="...">` 또는 `typography()` mixin

| Variant     | When                                                                   | Avoid                                                              |
| ----------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `display1`  | Hero headlines on landing pages, Main campaign copy                    | Standard page titles → `heading1`                                  |
| `display2`  | Marketing section heads, Emphasized copy blocks                        | Standard page titles → `heading1`                                  |
| `display3`  | Marketing sub-section heads, Emphasized regional titles                | Standard section titles → `heading2`                               |
| `display4`  | Small marketing area heads, Supporting emphasis copy                   | Body emphasis → `subtitle1`                                        |
| `heading1`  | Page main titles (one per page)                                        | Marketing hero → `display1`, Section titles → `heading2`           |
| `heading2`  | Section headings, Card or panel top titles                             | Page titles → `heading1`, Sub-section titles → `heading3`          |
| `heading3`  | Sub-section headings, Grouped unit titles                              | Section titles → `heading2`, Small group titles → `heading4`       |
| `heading4`  | Form section labels, Small unit group heads                            | Sub-section titles → `heading3`, Body emphasis → `subtitle1`       |
| `heading5`  | Sidebar group heads, Constrained area titles                           | Body text → `body1`                                                |
| `heading6`  | Minor group labels, Sidebar category heads                             | Body emphasis → `subtitle1`, General body text → `body1`           |
| `subtitle1` | Card subtitles, Form group labels, Supporting text under headers       | General body text → `body1`, Semantic headings → `heading4~6`      |
| `subtitle2` | Small card subtitles, Supporting meta labels                           | Captions → `body4`, General body text → `body2`                    |
| `body1`     | **Default** — General paragraphs, Descriptive text, Form labels/values | Semantic headings → `heading*`, Captions → `body4`                 |
| `body2`     | List items, Supporting descriptions, Small card body                   | Primary body text → `body1`, Captions → `body4`                    |
| `body3`     | Narrow sidebar body, Supporting guidance                               | General body text → `body1`, Captions → `body4`                    |
| `body4`     | Image captions, Footer meta, Timestamps, Fine-print                    | Primary body text → `body1`, Any content critical to comprehension |
| `code1`     | Inline code snippets, Variable names, Command names                    | General body text → `body2`                                        |
| `code2`     | Inline code within small body text                                     | General body text → `body3`                                        |

---

## Typography Primitives

composite 토큰의 `$value`가 참조하는 raw 값들.

**fontSize**
`025=10` · `050=12` · `075=14` · `100=16` · `200=18` · `300=20` · `400=24` · `500=32` · `600=38` · `700=48` · `800=64` · `900=80` · `1000=120` (px)

**lineHeight**
`025=14` · `050=18` · `075=22` · `100=24` · `200=26` · `300=30` · `400=36` · `500=48` · `600=56` · `700=62` · `800=84` · `900=104` · `1000=156` (px)

**fontWeight**
`400` (Regular) · `500` (Medium) · `700` (Bold) · `800` (ExtraBold)

**letterSpacing**
`000=0` · `100=-0.1` · `200=-0.2` · `300=-0.3` · `400=-0.4` (px)

**fontFamily**
`code` — FiraCode + system fallback chain · `sans` — Pretendard Variable + system fallback chain

---

## Shadow — `$css={{ boxShadow: '$...' }}`

| Token | When | Avoid |
| ----- | ---- | ----- |
| `$sm` | Card components, Inline popovers, Small dropdowns | Layered elements above modals or drawers → shadow.md or higher |
| `$md` | Dropdown menus, Tooltips, Context panels | — |
| `$lg` | Side panels, Large dropdowns, Overlay sheets | — |
| `$xl` | Modal dialogs, Fullscreen overlays | Cards and general panels → shadow.sm through shadow.lg |

---

## Primitive Palettes

사용자 코드에서 `$basic-*` 접두사로 직접 참조 시 **WARNING** (검사 7) — semantic 사용 권장. 단, semantic 토큰이 어떤 raw 색으로 해소되는지 이해할 때 참고.

- **색상 팔레트 (10단 — 050, 100~900):** `red` · `pink` · `grape` · `violet` · `blue` · `cyan` · `green` · `lime` · `yellow` · `orange` · `gray`
- **특수:** `black` · `white` · `canvas` (light/dark 모드별 값 존재)

`$basic-{palette}-{shade}` 형태로 참조 (예: `$basic-blue-500`). 모두 모드별 light/dark 값을 가짐.

---

## Light 모드 해소값 (참고)

semantic 토큰이 light 모드에서 어떤 hex로 풀리는지. 주로 사용자가 HEX 직타한 값을 보고 "어떤 semantic 토큰으로 바꾸면 좋을지" 역추적할 때 사용. dark 모드 값은 자동 전환되므로 추천 시 신경 쓰지 않아도 됨.

### Backgrounds

| `$css` Token        | CSS Variable                             | Light hex | Primitive 출처 |
| ------------------- | ---------------------------------------- | --------- | -------------- |
| `$bg-primary-100` | `--vapor-color-background-primary-100` | `#c6e6ff` | blue.100 |
| `$bg-primary-200` | `--vapor-color-background-primary-200` | `#2A72E5` | blue.500 |
| `$bg-secondary-100` | `--vapor-color-background-secondary-100` | `#f7f7f7` | gray.050 |
| `$bg-secondary-200` | `--vapor-color-background-secondary-200` | `#e1e1e1` | gray.100 |
| `$bg-success-100` | `--vapor-color-background-success-100` | `#bbecd7` | green.100 |
| `$bg-success-200` | `--vapor-color-background-success-200` | `#058765` | green.500 |
| `$bg-warning-100` | `--vapor-color-background-warning-100` | `#ffd9c8` | orange.100 |
| `$bg-warning-200` | `--vapor-color-background-warning-200` | `#d34701` | orange.500 |
| `$bg-danger-100` | `--vapor-color-background-danger-100` | `#ffd8d7` | red.100 |
| `$bg-danger-200` | `--vapor-color-background-danger-200` | `#da3944` | red.500 |
| `$bg-hint-100` | `--vapor-color-background-hint-100` | `#e1e1e1` | gray.100 |
| `$bg-hint-200` | `--vapor-color-background-hint-200` | `#5d5d5d` | gray.600 |
| `$bg-contrast-100` | `--vapor-color-background-contrast-100` | `#a3a3a3` | gray.300 |
| `$bg-contrast-200` | `--vapor-color-background-contrast-200` | `#393939` | gray.800 |
| `$bg-canvas-100` | `--vapor-color-background-canvas-100` | `#ffffff` | canvas |
| `$bg-canvas-200` | `--vapor-color-background-canvas-200` | `#f7f7f7` | gray.050 |
| `$bg-overlay-100` | `--vapor-color-background-overlay-100` | `#ffffff` | canvas |

### Foregrounds

| `$css` Token        | CSS Variable                             | Light hex | Primitive 출처 |
| ------------------- | ---------------------------------------- | --------- | -------------- |
| `$fg-primary-100` | `--vapor-color-foreground-primary-100` | `#0957c8` | blue.600 |
| `$fg-primary-200` | `--vapor-color-foreground-primary-200` | `#0043b3` | blue.700 |
| `$fg-secondary-100` | `--vapor-color-foreground-secondary-100` | `#393939` | gray.800 |
| `$fg-secondary-200` | `--vapor-color-foreground-secondary-200` | `#262626` | gray.900 |
| `$fg-success-100` | `--vapor-color-foreground-success-100` | `#006c4b` | green.600 |
| `$fg-success-200` | `--vapor-color-foreground-success-200` | `#00583a` | green.700 |
| `$fg-warning-100` | `--vapor-color-foreground-warning-100` | `#b72100` | orange.600 |
| `$fg-warning-200` | `--vapor-color-foreground-warning-200` | `#9e0000` | orange.700 |
| `$fg-danger-100` | `--vapor-color-foreground-danger-100` | `#bb1225` | red.600 |
| `$fg-danger-200` | `--vapor-color-foreground-danger-200` | `#9e0006` | red.700 |
| `$fg-hint-100` | `--vapor-color-foreground-hint-100` | `#5d5d5d` | gray.600 |
| `$fg-hint-200` | `--vapor-color-foreground-hint-200` | `#4c4c4c` | gray.700 |
| `$fg-contrast-100` | `--vapor-color-foreground-contrast-100` | `#393939` | gray.800 |
| `$fg-contrast-200` | `--vapor-color-foreground-contrast-200` | `#262626` | gray.900 |
| `$fg-normal-100` | `--vapor-color-foreground-normal-100` | `#4c4c4c` | gray.700 |
| `$fg-normal-200` | `--vapor-color-foreground-normal-200` | `#262626` | gray.900 |
| `$fg-inverse` | `--vapor-color-foreground-inverse` | `#FFFFFF` | white |

### Borders

| `$css` Token        | CSS Variable                             | Light hex | Primitive 출처 |
| ------------------- | ---------------------------------------- | --------- | -------------- |
| `$border-normal` | `--vapor-color-border-normal` | `#e1e1e1` | gray.100 |
| `$border-primary` | `--vapor-color-border-primary` | `#2A72E5` | blue.500 |
| `$border-secondary` | `--vapor-color-border-secondary` | `#c6c6c6` | gray.200 |
| `$border-success` | `--vapor-color-border-success` | `#058765` | green.500 |
| `$border-warning` | `--vapor-color-border-warning` | `#d34701` | orange.500 |
| `$border-danger` | `--vapor-color-border-danger` | `#da3944` | red.500 |
| `$border-hint` | `--vapor-color-border-hint` | `#5d5d5d` | gray.600 |
| `$border-contrast` | `--vapor-color-border-contrast` | `#393939` | gray.800 |

---

## 검사 시 사용법

1. **존재 확인 (검사 4)** — 위 표에서 토큰 키를 찾는다. 없으면 CRITICAL.
2. **컨텍스트 검증 (검사 5)** — `Avoid` 열을 확인. 사용자 코드의 적용 컨텍스트가 해당하면 CRITICAL.
3. **대안 제안** — 같은 카테고리 표에서 `When` 열이 사용자 의도와 일치하는 토큰을 골라 제안. 표에 없는 이름은 만들지 않는다.
4. **HEX → 토큰 역추적** — 사용자가 HEX 직타한 값과 비슷한 색을 "Light 모드 해소값" 표에서 찾아 가까운 semantic 토큰을 추천.
5. **fallback 매칭 (검사 6)** — `var(--vapor-{category}-{key}, FALLBACK)`의 fallback이 위 px 매핑(size 카테고리) 또는 light hex(color 카테고리)와 일치하는지 확인.

