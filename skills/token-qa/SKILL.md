---
name: token-qa
description: "Vapor UI 디자인 토큰 QA 검수 스킬. 다음 상황에서 반드시 이 스킬을 사용할 것: /token-qa 호출, '토큰 검수', '토큰 QA', '토큰 확인', 'vapor 토큰 검사', 'design token 검증', using-vapor 세션에서 코드 작성 후 자동 호출, 기존 파일이나 디렉토리의 토큰 사용 일관성 점검 요청. TSX/JSX/CSS/SCSS 파일에서 하드코딩 색상(#hex, rgb, hsl), 하드코딩 크기(px/rem/em), inline style 사용, 잘못된 토큰명, 스코프 불일치 등 디자인 시스템 위반을 탐지하고 CRITICAL/WARNING/PASS 리포트를 출력한다. 파일을 직접 수정하지는 않는다."
---

# token-qa — Vapor UI 디자인 토큰 QA

Vapor UI 코드의 디자인 토큰 일관성을 검사하고 위반을 리포트한다.

## 시작 시 필수 행동

1. **`token-catalog.md`를 Read로 먼저 읽는다.** 모든 토큰 키 + when/avoid + px 매핑 + light hex 해소값이 한 파일에 압축돼 있다. 이것이 토큰 카탈로그의 유일한 참조다.
2. **외부 파서 실행 금지.** Python/jq 등으로 JSON 파싱하지 말 것 — 스킬에는 JSON이 없으며, 모든 정보는 `token-catalog.md` 한 파일을 Read 한 번으로 얻을 수 있다.
3. **파일을 직접 수정하지 말 것.** 토큰 선택은 디자인 결정이므로 위반만 리포트하고 수정 여부는 사용자가 결정. 단 사용자가 "수정해줘"라고 명시하면 그때 권장 토큰을 적용.

---

## 검사 대상

호출자가 지정한 파일 또는 디렉토리. `using-vapor` 세션에서 호출됐다면 그 세션이 작성/수정한 파일이 대상.

**확장자:** `.tsx`, `.jsx`, `.ts`, `.js`, `.css`, `.scss`, `.module.css`, `.module.scss`

**건너뛰는 파일:** `package.json` · `tsconfig.json` · `vite.config.*` · `.eslintrc.*` · `*.config.{js,ts}` · 락 파일 · `*.test.*` · `*.spec.*` · `*.stories.tsx` · `*.md` · `dist/` · `build/` · `node_modules/`

---

## 사전 스캔

검사 대상에 토큰 관련 패턴이 하나라도 매치되는지 먼저 확인. 매치 0이면 QA 종료.

| 그룹                    | 패턴                                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inline style            | `style={` · `style: {` · `style:` (객체 형태)                                                                                                              |
| CSS-in-JS / `$css` prop | `$css={` · `$css: ` · `css\`` · `styled.`                                                                                                                  |
| CSS 속성 (camelCase)    | `backgroundColor` · `color:` · `padding` · `margin` · `gap` · `width` · `height` · `borderRadius` · `boxShadow` · `fontSize` · `fontWeight` · `lineHeight` |
| CSS 속성 (kebab-case)   | `background-color:` · `color:` · `padding:` · `margin:` · `gap:` · `border-radius:` · `box-shadow:` · `font-size:`                                         |
| 토큰 직접 참조          | `$primary-` · `$secondary-` · `$success-` · `$warning-` · `$danger-` · `$fg-` · `$bg-` · `$border-` · `var(--vapor-`                                       |

---

## 검사 항목

### 1. 하드코딩 색상 (CRITICAL)

색상 토큰을 우회하면 다크 모드·브랜드 변경·접근성 보정이 적용되지 않는다.

**탐지:** `#[0-9a-fA-F]{3,8}` 패턴, `rgb(`/`rgba(`/`hsl(`/`hsla(`/`oklch(`/`lab(` 함수, 색상 키워드(`red`/`blue`/`white`/`black` 등).

**허용:** `transparent` · `currentColor` · `inherit` · 주석 내부 · `var(--token, fallback)` 의 fallback 위치.

### 2. 하드코딩 크기/간격 (WARNING)

토큰을 우회하면 반응형·밀도 모드 같은 미래 변경을 막는다.

**탐지:** `padding`/`margin`/`gap`/`width`/`height`/`borderRadius` 등에 `'16px'`·`'1rem'`·`'2em'` 같은 리터럴.

**허용:** `0`/`0px` · `1px` (hairline) · `100%`/`auto`/`fit-content` · `9999px` (pill) · `50%` (circle) · `var(--token, fallback)` 의 fallback 위치.

### 3. inline `style=` prop 사용 (WARNING)

`$css` prop은 토큰 자동완성과 타입 안전성을 제공한다. `style=`은 이 시스템을 우회한다.

**허용:** `transform: translate(...)` 같은 동적 계산값, 토큰화 불가능한 일회성 위치 보정.

### 4. 존재하지 않는 토큰명 (CRITICAL)

카탈로그에 없는 토큰은 런타임에 undefined로 해소되어 디자인이 깨지지만 빌드는 통과해버린다.

**탐지:** token-catalog에 키가 없으면 CRITICAL. 예: `$bg-secondary-200` (secondary는 `-100`만 존재), `$bg-normal-100` (background에 `normal` 역할 없음).

### 5. 잘못된 컨텍스트에서 토큰 사용 (CRITICAL)

semantic 토큰은 각자 의도된 사용처가 있다. `bg-primary-200`은 filled 버튼 배경용으로 설계된 색이라 텍스트에 쓰면 다크 모드에서 배경/전경이 함께 반전되지 않고 대비비(contrast ratio)도 보장되지 않는다. 토큰 이름이 카탈로그에 있다고 올바르게 쓰였다는 뜻이 아니다.

**탐지:** token-catalog의 `Avoid` 열이 사용자 코드의 적용 컨텍스트와 일치하면 CRITICAL.

**예:** `<Text $css={{ color: '$bg-primary-200' }}>` → `bg-primary-200`의 Avoid에 "Text and icon colors → fg-primary-\*" 명시 → CRITICAL.

### 6. CSS Custom Property — 변수명/fallback 불일치 (CRITICAL)

`var(--token, fallback)`에서 변수명과 fallback이 다르면 CSS 변수 미로딩 환경(SSR 첫 렌더, 변수 미주입 빌드, iframe 등)에서 UI가 의도와 다르게 렌더되고, 사용자가 토큰을 바꿔도 fallback이 영구 적용되어 토큰 시스템이 무력화된다.

**탐지 두 케이스:**

1. 변수명이 카탈로그에 없음 — fallback이 영구 적용. 예: `var(--vapor-color-background-canvas, #f5f6f8)` — 실제 변수는 `--vapor-color-background-canvas-100` 형태.
2. 변수명은 있지만 fallback 값이 토큰 실제 값과 불일치. 예: `var(--vapor-size-space-200, 12px)` — `space.200`은 16px인데 fallback은 12px.

**검사 방법:** 변수명에서 카테고리를 추출해 token-catalog의 해당 표에서 키 조회. fallback 리터럴과 매핑된 값을 비교. 둘 다 통과하면 정상 사용 (위반 아님).

### 7. Primitive 토큰 직접 사용 (WARNING)

Primitive(`$basic-blue-500` 등)는 raw 값이라 다크 모드·테마 전환이 안 따라온다. semantic(`$bg-primary-200`/`$fg-secondary-200` 등)을 권장.

**탐지:** `$basic-` 접두사를 가진 토큰의 직접 참조.

---

## QA 실행 순서

1. **사전 스캔** — 대상 파일에 트리거 패턴 매치 확인. 매치 0이면 종료.
2. **token-catalog 로드** — `token-catalog.md`를 Read로 한 번 읽는다. Python 금지.
3. **검사 실행** — 매치된 파일을 순서대로 검사. 각 위반을 줄 번호와 함께 수집. 사용된 토큰이 `Avoid` 열에 해당하는지도 확인.
4. **token-catalog로 안 풀리는 케이스** — 누락된 정보(예: dark 모드 hex 같은 매우 드문 요구)가 필요하면 사용자에게 직접 묻거나 Vapor UI 패키지 소스를 참조하라고 안내. 추정 금지.
5. **리포트 작성** — 아래 출력 형식 사용. 토큰 대안은 token-catalog에서 인용한 이름만 사용 — 추정 금지.

### 추정 금지

token-catalog에 없는 토큰 이름을 만들어내지 말 것. 적합한 semantic 토큰이 안 보이면 정직하게 "정확히 일치하는 토큰을 찾지 못했습니다"라고 보고하고 의미적으로 인접한 후보 2~3개를 token-catalog에서 인용한다.

---

## 출력 형식

위반이 있을 때:

```md
## 토큰 QA 결과

**검사 파일** ({N}개):

- {파일 경로 목록}

**요약:** CRITICAL {n}건 / WARNING {n}건

### CRITICAL ({n}건)

**[C1]** `{파일 경로}:{줄 번호}`

\`\`\`{언어}
{문제 코드 한 줄}
\`\`\`

→ **문제:** {설명}
→ **수정 방법:** {구체적 대안 — prop 이름, 토큰 이름, 예시 코드}

### WARNING ({n}건)

**[W1]** `{파일 경로}:{줄 번호}` — {짧은 설명 + 대안}

### PASS

- [v] {통과한 검사 항목}
```

위반이 없을 때:

```md
## 토큰 QA 결과 ✓

**검사 파일** ({N}개): {목록}

디자인 토큰이 일관되게 사용되었습니다. CRITICAL/WARNING 0건.
```

---

## 호출 시나리오

- **직접 호출:** `/token-qa src/components/LoginForm.tsx`
- **using-vapor 자동 호출:** 세션에서 코드 작성 완료 시 작성된 파일 경로 목록과 함께 자동 트리거
- **디렉토리 일괄 검사:** "src/pages/ 전부 토큰 QA 돌려줘"
