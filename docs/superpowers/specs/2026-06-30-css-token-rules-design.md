# eslint-plugin-vapor: CSS 디자인 토큰 룰 설계

- 날짜: 2026-06-30
- 대상 패키지: `packages/eslint-plugin-vapor`
- 토큰 SSOT: `skills/token-lint/assets/*.json` → 패키지 내부 `src/data/tokens/` 로 수동 복붙
- 브랜치: `eslint-plugin-css-tokens`
- 기존 spec/plan (`2026-06-22-…`, `2026-06-23-…`) 은 폐기 — 본 문서가 대체

## 1. 목적

`eslint-plugin-vapor` 에 CSS 파일용 디자인 토큰 검사 룰 3개를 추가한다. 사용자는 플러그인 설치 후 다음을 자동으로 점검 받는다.

1. `--vapor-*` 형태 토큰의 오타·미존재 검사 (`css/no-invalid-design-token`)
2. 토큰이 CSS property 의 scope 와 맞는지 검사 (`css/token-scope-mismatch`)
3. Primitive 토큰 / raw 값 사용 시 더 적절한 토큰 추천 (`css/prefer-design-token`)

기존 a11y 룰 4종 (`icon-button-has-aria-label`, `navigation-has-aria-label`, `avatar-has-alt-text`, `dialog-should-have-title`) 과 동일 패키지에 추가한다.

## 2. 범위 / 비범위

### 범위 (v1)

- 순수 CSS 파일 (`.css`). `@eslint/css` (ESLint 공식 CSS language plugin) 환경에서 동작.
- 토큰 카테고리: `color`(semantic + primitive), `dimension`, `space`, `borderRadius`, `shadow` (토큰명 매칭만).
- 메시지/에러 종류별 룰 분리 — 3 룰 완전 분리.

### 비범위 (v1)

- `.scss`, `.sass`, `.less` 파일 (`@eslint/css` 미지원).
- JS/TS/JSX/TSX 의 inline style / CSS-in-JS — 별도 브랜치/룰. 본 v1 미포함.
- `typography` / `text-style` 검사 — v2 에서 다룬다.
- shadow raw value 매칭 (`box-shadow: 0 2px 4px ...`) — 토큰 이름 사용 시 scope 검사만.
- 다크 테마 hex 매칭 — v1 은 light 테마 hex 기준만.
- shorthand 디컴포지션 (예: `border: 1px solid #f00`) — best-effort raw 추출, scope 검사 skip.
- autofix (`--fix`) — ESLint suggestion API 만 제공.
- 토큰 JSON 자동 동기화 스크립트 — 수동 복붙으로 유지.

## 3. 아키텍처

```
packages/eslint-plugin-vapor/
├── src/
│   ├── data/
│   │   ├── tokens/                            # NEW — skills/token-lint/assets 수동 복붙
│   │   │   ├── border-radius.json
│   │   │   ├── dimension.json
│   │   │   ├── space.json
│   │   │   ├── shadow.json
│   │   │   ├── typography.json
│   │   │   ├── text-style.json
│   │   │   ├── primitive-color.light.json
│   │   │   ├── primitive-color.dark.json
│   │   │   ├── semantic-color.light.json
│   │   │   ├── semantic-color.dark.json
│   │   │   └── resolver.json
│   │   └── property-scope-map.ts              # NEW — property → Scope[] hardcoded
│   ├── utils/
│   │   ├── token-index.ts                     # NEW — JSON parse, in-memory 인덱스
│   │   ├── token-scope.ts                     # NEW — 토큰명 3번째 세그먼트 → scope
│   │   ├── color-resolver.ts                  # NEW — oklch → hex via culori
│   │   ├── css-value-parser.ts                # NEW — value 에서 var()/hex/dimension 추출
│   │   ├── segment-distance.ts                # NEW — Damerau-Levenshtein + segment 거리 (typo 후보)
│   │   ├── allowlist-matcher.ts               # NEW — glob 매칭 (`--vapor-app-*`)
│   │   └── (기존 guard.ts, get-source.ts 그대로)
│   ├── rules/
│   │   ├── css/
│   │   │   ├── no-invalid-design-token.ts          # NEW
│   │   │   ├── no-invalid-design-token.test.ts     # NEW
│   │   │   ├── token-scope-mismatch.ts             # NEW
│   │   │   ├── token-scope-mismatch.test.ts        # NEW
│   │   │   ├── prefer-design-token.ts              # NEW
│   │   │   └── prefer-design-token.test.ts         # NEW
│   │   └── (기존 a11y 4 룰 그대로)
│   ├── types/estree.d.ts                      # (기존 그대로)
│   └── index.ts                               # 3 룰 추가 등록 + `css` preset export
└── package.json                               # culori dep, @eslint/css peer-optional
```

### 데이터 흐름

1. **빌드 시점** — `tsup` 가 `src/data/tokens/*.json` 을 import 한 모듈을 bundling 단계에서 inline. 별도 추출 스크립트 없음.
2. **런타임 (룰 로드)** — `token-index.ts` 가 module-scope IIFE 로 인덱스 한 번 구축:
   - `canonicalTokens: Set<string>` — semantic light + dark + primitive light + dark + foundation (dimension/space/borderRadius/shadow/typography/text-style) 전체 토큰명 union.
   - `tokenMeta: Map<name, { scope: Scope, kind: 'primitive' | 'semantic' | 'foundation', hex?: string, px?: number }>`
     - semantic-color: `scope = 토큰명 3번째 세그먼트` (foreground/background/border), `hex = resolved hex (light)`, `kind = 'semantic'`.
     - primitive-color: `kind = 'primitive'`, `scope = 'primitive'` (자체 scope 없음 — 따로 처리), `hex = formatHex(parse(oklchString))`.
     - dimension / space / border-radius: `kind = 'foundation'`, `scope = 'dimension' | 'space' | 'borderRadius'`, `px = number` (스케일 → px 변환은 토큰 JSON 의 value 사용).
   - `byHex: Map<lowerHex, name[]>` — semantic + primitive 둘 다.
   - `byPx: Map<number, name[]>` — dimension/space/borderRadius.
   - 인덱스는 module load 1회만 수행. 이후 모든 룰이 공유.
3. **룰 실행** — `@eslint/css` 의 `Declaration` visitor → `property` + `value` 검사 → 룰별 판정 → `context.report` (suggest 포함).

### `property-scope-map.ts`

```ts
export type Scope =
  | 'foreground'
  | 'background'
  | 'border'
  | 'dimension'
  | 'space'
  | 'borderRadius'
  | 'shadow';

export const PROPERTY_SCOPE: Record<string, Scope[]> = {
  // foreground
  color: ['foreground'],
  fill: ['foreground'],
  stroke: ['foreground'],

  // background
  'background-color': ['background'],
  background: ['background'],

  // border
  'border-color': ['border'],
  'border-top-color': ['border'],
  'border-right-color': ['border'],
  'border-bottom-color': ['border'],
  'border-left-color': ['border'],
  'outline-color': ['border'],

  // dimension
  width: ['dimension'],
  'min-width': ['dimension'],
  'max-width': ['dimension'],
  height: ['dimension'],
  'min-height': ['dimension'],
  'max-height': ['dimension'],

  // space
  gap: ['space'],
  'row-gap': ['space'],
  'column-gap': ['space'],
  padding: ['space'],
  'padding-top': ['space'],
  'padding-right': ['space'],
  'padding-bottom': ['space'],
  'padding-left': ['space'],
  'padding-inline': ['space'],
  'padding-block': ['space'],
  margin: ['space'],
  'margin-top': ['space'],
  'margin-right': ['space'],
  'margin-bottom': ['space'],
  'margin-left': ['space'],
  'margin-inline': ['space'],
  'margin-block': ['space'],
  inset: ['space'],
  top: ['space'],
  right: ['space'],
  bottom: ['space'],
  left: ['space'],

  // borderRadius
  'border-radius': ['borderRadius'],
  'border-top-left-radius': ['borderRadius'],
  'border-top-right-radius': ['borderRadius'],
  'border-bottom-left-radius': ['borderRadius'],
  'border-bottom-right-radius': ['borderRadius'],

  // shadow
  'box-shadow': ['shadow'],
};
```

## 4. Rule: `css/no-invalid-design-token`

### 목적

카탈로그에 존재하지 않는 `--vapor-*` 토큰 (오타, 폐기) 감지.

### Visitor

- `@eslint/css` AST 의 `Declaration` 노드 → `value` 안의 `Function(name="var")` 인자 첫 `Identifier` 가 `--vapor-` 로 시작하면 후보.
- value 내부 offset 정확 기록 → suggestion 의 fix range 계산용.

### 판정

1. `canonicalTokens.has(tokenName)` → skip
2. `allowCustomTokens` (글로벌 + 룰 옵션) glob 매치 → skip
3. 그 외 → report

### 메시지

- `unknownToken`: `"{{ token }}" is not a Vapor design token.`
- `unknownTokenWithSuggestions`: `"{{ token }}" is not a Vapor design token. Did you mean: {{ candidates }}?`
- suggestion 메시지: `replaceWithToken` — `Replace with "{{ candidate }}"`

### 후보 산정

- `segment-distance.ts`: 토큰을 `-` 로 split → 세그먼트별 Damerau-Levenshtein, per-segment ≤ 1, total ≤ 2 → 후보 ≤ 3.

### 옵션 스키마

```ts
type Options = [{
  allowCustomTokens?: string[];   // glob, ex. ['--vapor-app-*']
}];
```

또한 `settings.vapor.customTokens` 글로벌 allowlist 도 동일 형식으로 지원.

### 예시

```css
/* invalid */
.x { color: var(--vapor-color-foregruond-primary-100); }
/* unknownTokenWithSuggestions: Did you mean: --vapor-color-foreground-primary-100? */
```

## 5. Rule: `css/token-scope-mismatch`

### 목적

카탈로그에 **존재**하지만 사용된 CSS property 의 scope 와 어긋난 토큰 감지.

### Visitor

- `Declaration` 의 property name + value 의 var() 토큰.
- canonical 한 토큰만 검사 (미존재 토큰은 룰 A 책임).

### 판정

1. `PROPERTY_SCOPE[property]` 미정의 → skip (모르는 property 는 검사 안 함).
2. `options.ignoreProperties` 포함 → skip.
3. `tokenMeta.get(name)` 에서 `scope` 추출.
   - semantic-color: 3번째 세그먼트 = scope (foreground/background/border).
   - foundation: 카테고리 (dimension/space/borderRadius/shadow).
   - primitive-color: scope='primitive' → **본 룰은 false** (primitive 는 자체 scope 가 없음, scope mismatch 판정 대상 아님. primitive 사용은 룰 C 에서 다룬다).
4. `expectedScopes = PROPERTY_SCOPE[property]`.
5. `tokenScope ∉ expectedScopes` → report.

### 메시지

- `scopeMismatch`: `"{{ token }}" has scope "{{ tokenScope }}" but "{{ property }}" expects {{ expectedScopes }}.`
- `scopeMismatchWithSuggestions`: 위 + ` Candidate: {{ candidates }}.`

### 후보 산정

- 색상 토큰: `byHex.get(tokenMeta.get(name).hex)` 중 `expectedScopes` 에 속하는 semantic 토큰 추출, top-3.
- foundation: 동일 카테고리 내에서는 발생 안 함 (dimension 토큰을 width 에 쓰면 OK). 카테고리 어긋남 시 (`var(--vapor-size-space-150)` 을 `width` 에 사용) `byPx` 로 expectedScopes 의 토큰 추출.
- 후보 0 개면 `scopeMismatch` (suggestion 없음) 메시지 사용.

### 옵션 스키마

```ts
type Options = [{
  propertyScopeMap?: Record<string, Scope[]>;   // 기본 맵에 merge (사용자 override / 추가)
  ignoreProperties?: string[];
}];
```

### 예시

```css
.x { color: var(--vapor-color-background-secondary-100); }
/* scopeMismatchWithSuggestions: "--vapor-color-background-secondary-100" has scope "background" but "color" expects [foreground]. Candidate: --vapor-color-foreground-secondary-100. */
```

## 6. Rule: `css/prefer-design-token`

### 목적

두 케이스 통합:

- **C-1 (primitive → semantic)**: primitive 토큰 사용 시 동일 hex + scope 일치하는 semantic 토큰이 있으면 추천.
- **C-2 (raw → token)**: hex / dimension raw 값 사용 시 토큰 추천 — **동일 scope semantic 우선, 없으면 primitive, 그것도 없으면 보고하지 않음**.

### Visitor

- `Declaration` 의 property + value.
- 룰 A 가 report 한 동일 토큰은 skip (이중 보고 방지 — A 의 `unknownToken` 이 발생한 토큰).
- 룰 B 가 report 한 동일 토큰은 skip (이중 보고 방지).

### 판정 — C-1 (primitive → semantic)

1. `tokenMeta.get(name).kind === 'primitive'` 인 var() 사용.
2. `expectedScopes = PROPERTY_SCOPE[property]` (없으면 skip).
3. `options.ignoreProperties` 포함 → skip.
4. `byHex.get(primitiveHex)` 중 `kind==='semantic'` 이고 `scope ∈ expectedScopes` 인 후보 ≥ 1 → report.

### 판정 — C-2 (raw → token)

1. value 의 raw 노드 추출:
   - `Hash` (hex literal) → 정규화 `#rgb`/`#rgba`/`#rrggbb`/`#rrggbbaa` → lower `#rrggbb` 또는 `#rrggbbaa`.
   - `Dimension` (number + unit) → unit `px` 만 v1, value=number.
   - 그 외 unit (`rem`, `em`, `%`, `vh`, …) → v1 skip.
2. `options.ignoreValues` 매치 → skip. 기본: `['0','0px','transparent','none','currentcolor','inherit','initial','unset']`.
3. `expectedScopes = PROPERTY_SCOPE[property]` (없으면 skip).
4. 후보 산정 (우선순위) — raw 종류별 분기:
   - **색상 컨텍스트** (raw 가 hex, `expectedScopes ⊆ {foreground, background, border}`):
     - 1순위: `byHex.get(hex)` 중 `kind==='semantic'` ∩ `scope ∈ expectedScopes`.
     - 2순위 (1순위 0 개일 때만): `byHex.get(hex)` 중 `kind==='primitive'`. primitive 는 자체 scope 없으므로 hex 만 일치하면 후보.
     - 3순위 (위 모두 0 개): 보고하지 않음.
   - **foundation 컨텍스트** (raw 가 px, `expectedScopes ⊆ {dimension, space, borderRadius}`):
     - 1순위: `byPx.get(px)` 중 `kind==='foundation'` ∩ `scope ∈ expectedScopes`.
     - 2순위: 없음 (foundation 토큰에는 primitive 가 없음).
     - 후보 0 개면 보고하지 않음.
5. 후보 ≥ 1 → report, top-`maxSuggestions` (기본 3).

### 메시지

- `preferSemantic` (C-1): `Use semantic token "{{ candidate }}" instead of primitive "{{ token }}" on "{{ property }}".`
- `preferToken` (C-2): `Use design token "{{ candidate }}" instead of "{{ rawValue }}" on "{{ property }}".`
- 후보가 여럿이면 suggestion API 로 각각 fix 제공.

### 옵션 스키마

```ts
type Options = [{
  categories?: Scope[];                  // 검사할 scope 만. default: 전부.
  ignoreProperties?: string[];
  ignoreValues?: string[];               // default: ['0','0px','transparent','none','currentcolor','inherit','initial','unset']
  maxSuggestions?: number;               // default: 3
}];
```

### 예시

```css
/* C-1: primitive → semantic */
.x { color: var(--vapor-color-blue-600); }
/* preferSemantic: Use semantic token "--vapor-color-foreground-primary-100" instead of primitive "--vapor-color-blue-600" on "color". */

/* C-2: raw hex → semantic (동일 scope 우선) */
.y { background-color: #f7f7f7; }
/* preferToken: Use design token "--vapor-color-background-secondary-100" instead of "#f7f7f7" on "background-color". */

/* C-2: raw hex → primitive (semantic 부재, primitive fallback) */
.z { border-color: #632700; }
/* preferToken: Use design token "--vapor-color-yellow-800" instead of "#632700" on "border-color". */

/* C-2: raw px → foundation */
.w { width: 12px; }
/* preferToken: Use design token "--vapor-size-dimension-150" instead of "12px" on "width". */

/* 보고 안 함 — 후보 없음 */
.q { color: #abcdef; }
```

### 룰 간 책임 경계 (재명시)

- **A**: 카탈로그 미존재 토큰 → report 후 B, C 는 동일 토큰 skip.
- **B**: 카탈로그 존재 + scope 어긋남 → report 후 C 는 동일 토큰 skip.
- **C**: 위 둘 모두 통과 + 더 나은 대안 존재 → report.

같은 declaration 내 다른 토큰/raw 값은 독립적으로 평가.

## 7. 테스트 전략

### 러너 / 환경

- `vitest` + ESLint `RuleTester`.
- `RuleTester` 설정에 `language: 'css/css'`, `plugins: { css: cssPlugin }`.
- 테스트 파일은 룰 옆에 inline (`*.test.ts`) — 기존 a11y 룰 패턴과 동일.

### 커버리지 매트릭스

| 케이스 | A `no-invalid` | B `scope-mismatch` | C `prefer-design-token` |
|---|---|---|---|
| Valid: 카탈로그 토큰 + scope 일치 | ✓ | ✓ | ✓ |
| Valid: `ignoreProperties` | — | ✓ | ✓ |
| Valid: `ignoreValues` | — | — | ✓ |
| Valid: `allowCustomTokens` glob | ✓ | — | — |
| Invalid: 미존재 토큰 (오타, suggestion 1개) | ✓ | — | — |
| Invalid: 미존재 토큰 (suggestion 0개) | ✓ (unknownToken) | — | — |
| Invalid: 미존재 토큰 (suggestion 다수) | ✓ | — | — |
| Invalid: scope 어긋남 (semantic background → color) | — | ✓ | — |
| Invalid: scope 어긋남 (foundation 카테고리 어긋남) | — | ✓ | — |
| Invalid: primitive → semantic 후보 1개 | — | — | ✓ (preferSemantic) |
| Invalid: primitive → semantic 후보 다수 | — | — | ✓ |
| Invalid: hex → semantic (동일 scope) | — | — | ✓ (preferToken) |
| Invalid: hex → primitive (semantic 부재) | — | — | ✓ (preferToken, primitive 후보) |
| Invalid: hex → 후보 없음 | — | — | Valid (보고 안 함) |
| Invalid: px → foundation | — | — | ✓ |
| Edge: `0`, `0px`, `transparent`, `none` | — | — | Valid (ignoreValues) |
| Edge: shorthand (`padding: 12px 8px`) | — | — | 다중 보고 (각 Dimension 별) |
| Edge: 한 declaration 다중 위반 | A 다중 | B 다중 | C 다중 |
| Edge: A + B 동시 후보 토큰 | A invalid → B skip | — | C skip |
| Edge: value 내부 offset 정확 보고 | ✓ | ✓ | ✓ |
| Edge: case-insensitive hex (`#FFF` vs `#fff`) | — | — | ✓ |
| Edge: 4/8-digit hex 정규화 | — | — | ✓ |
| Edge: dark-theme 토큰 사용 | (canonical union) | (scope 추출 동일) | (light hex 기준 매칭) |

### Fixture 정책

- 별도 fixture 디렉토리 없음. 테스트 코드 내 string literal 로 inline.
- 룰당 valid 5+ / invalid 8+ 케이스 목표.

## 8. 빌드 / 통합

### 의존성 추가

`packages/eslint-plugin-vapor/package.json`:

```json
{
  "dependencies": {
    "culori": "^4.0.1"
  },
  "devDependencies": {
    "@eslint/css": "^0.6.0"
  },
  "peerDependenciesMeta": {
    "@eslint/css": { "optional": true }
  }
}
```

- `culori`: primitive oklch → hex (`import { formatHex, parse } from 'culori/fn'` — 트리쉐이크).
- `@eslint/css`: peer optional. 사용자가 CSS 룰 안 쓰면 미설치 OK.

### tsup

- 기존 `build` script (`tsup`) 그대로. JSON import 는 tsup 기본 처리 → dist 에 inline.
- 별도 `tsup.config.ts` 추가 안 함.

### `src/index.ts` 변경

```ts
import type { Rule } from 'eslint';

import { altTextOnAvatarRule } from './rules/alt-text-on-avatar';
import { ariaLabelOnIconButtonRule } from './rules/aria-label-on-icon-button';
import { ariaLabelOnNavigationRule } from './rules/aria-label-on-navigation';
import { shouldHaveTitleOnDialogRule } from './rules/should-have-title-on-dialog';

import { noInvalidDesignTokenRule } from './rules/css/no-invalid-design-token';
import { tokenScopeMismatchRule } from './rules/css/token-scope-mismatch';
import { preferDesignTokenRule } from './rules/css/prefer-design-token';

const rules = {
  'icon-button-has-aria-label': ariaLabelOnIconButtonRule,
  'navigation-has-aria-label': ariaLabelOnNavigationRule,
  'avatar-has-alt-text': altTextOnAvatarRule,
  'dialog-should-have-title': shouldHaveTitleOnDialogRule,
  'css/no-invalid-design-token': noInvalidDesignTokenRule,
  'css/token-scope-mismatch': tokenScopeMismatchRule,
  'css/prefer-design-token': preferDesignTokenRule,
} satisfies Record<string, Rule.RuleModule>;

const a11yRecommended = {
  'vapor/icon-button-has-aria-label': 'error',
  'vapor/navigation-has-aria-label': 'error',
  'vapor/avatar-has-alt-text': 'error',
  'vapor/dialog-should-have-title': 'error',
} as const;

const cssRecommended = {
  'vapor/css/no-invalid-design-token': 'error',
  'vapor/css/token-scope-mismatch': 'error',
  'vapor/css/prefer-design-token': 'warn',
} as const;

const plugin = {
  meta: { name: 'eslint-plugin-vapor', version: '0.1.0' },
  rules,
  configs: { flat: {}, legacy: {}, css: {} },
};

Object.assign(plugin.configs, {
  flat: { plugins: { vapor: plugin }, rules: a11yRecommended },
  legacy: { plugins: ['vapor'], rules: a11yRecommended },
  css: { plugins: { vapor: plugin }, rules: cssRecommended },
});

export default plugin;
```

### 사용자 flat config 예시 (README 추가)

```js
import vapor from 'eslint-plugin-vapor';
import css from '@eslint/css';

export default [
  vapor.configs.flat,

  {
    files: ['**/*.css'],
    plugins: { css, vapor: vapor.configs.css.plugins.vapor },
    language: 'css/css',
    rules: vapor.configs.css.rules,
  },

  {
    settings: { vapor: { customTokens: ['--vapor-app-*'] } },
  },
];
```

### CHANGELOG

- `changesets` 가 자동 관리.
- 구현 PR 에서 `pnpm changeset` 실행 → `feat: add CSS token rules` minor 변경 기록.

## 9. 성공 기준

1. 3 룰 `eslint-plugin-vapor` 에 등록 및 export.
2. `pnpm --filter eslint-plugin-vapor test` 통과 — 모든 매트릭스 케이스.
3. `pnpm --filter eslint-plugin-vapor build` 통과 — JSON inline, dist 생성.
4. `pnpm --filter eslint-plugin-vapor typecheck` 통과.
5. `pnpm --filter eslint-plugin-vapor lint` 통과.
6. 실 vapor 컴포넌트 CSS 파일 1개 이상에 적용해 룰 동작 manual smoke 확인.
7. README 에 사용법 / 옵션 / preset / 한계 (v1 비범위) 명시.

## 10. 리스크 / 완화

| 리스크 | 영향 | 완화 |
|---|---|---|
| `@eslint/css` API 불안정 (pre-1.0) | 룰 깨질 가능성 | peer optional, semver caret, 단일 진입점 (Declaration visitor) 만 사용 |
| culori 번들 크기 | dist 부피 | `culori/fn` 트리쉐이크 진입점 사용, formatHex/parse 만 import |
| 다크 테마 hex 매칭 누락 | 다크 전용 raw value 추천 미발생 | v1 비범위 명시. README 한계 항목 |
| Primitive → semantic 후보 다수 (같은 hex 여러 semantic) | 잘못된 추천 위험 | `expectedScopes` 필터 + `maxSuggestions=3` 제한 |
| Shorthand value 파싱 한계 | scope 매핑 부정확 | v1: shorthand 는 raw token (hex/px) 만 추출, scope 검사 skip |
| 토큰 JSON 동기화 (skill 변경 시 패키지 stale) | 신규 토큰 미반영 | 수동 복붙 결정. README 에 동기화 절차 + 변경일 명시 |
| CSS-in-JS 사용자 혼동 | "왜 JSX style 은 검사 안 됨?" | README v1 = CSS 파일 한정 명시 + 향후 확장 로드맵 |

## 11. v2 후속 과제

- `typography` / `text-style` 검사 (font-size / line-height / letter-spacing → text-style 토큰 매칭).
- 다크 테마 hex 매칭.
- shorthand 디컴포지션 (longhand 분해 후 검사).
- JS/TS/JSX (CSS-in-JS, inline style) 룰 — 본 v1 의 util 을 재사용해 새 룰 패키지로.
- shadow raw value 매칭.
- 토큰 JSON 자동 동기화 스크립트 또는 SSOT 패키지 분리.
- `--fix` autofix 안전성 검토 후 도입.

## 12. Open Questions (해결됨)

| Q | A |
|---|---|
| 적용 범위 | CSS 파일만 (v1), util 추상화로 향후 확장 |
| Scope 매핑 정의 | TS 상수 hardcoded (`property-scope-map.ts`) |
| Scope 추출 규칙 | 토큰명 3번째 세그먼트 = scope |
| Rule 분리 | 3 룰 완전 분리 |
| Token assets 통합 | `skills/token-lint/assets` JSON 그대로 수동 복붙 |
| 동일 hex semantic 부재 시 fallback | primitive 만 (다른 scope semantic 제외) |
| 테마 기준 | light 만 |
| typography / shadow raw | v1 비범위, v2 |
| Recommended severity | `prefer-design-token` = warn, 나머지 = error |
| Changeset | 구현 PR 에서 minor 추가 |
| 토큰 동기화 스크립트 | 작성하지 않음 (수동 복붙) |
