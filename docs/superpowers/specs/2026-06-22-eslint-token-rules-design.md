# eslint-plugin-vapor: 디자인 토큰 룰 추가 설계

- 날짜: 2026-06-22
- 대상 패키지: `packages/eslint-plugin-vapor`
- 토큰 SSOT: `skills/token-lint/assets/*.json`

## 1. 목적

`eslint-plugin-vapor`에 디자인 토큰 검사 룰을 추가한다. 사용자는 플러그인 설치 후 다음을 자동으로 점검 받는다.

1. `--vapor-*` 형태로 작성된 토큰 이름의 오타·미존재 토큰 (`no-invalid-design-token`)
2. raw 값 사용 시, 카탈로그에 1:1 대응하는 토큰이 있으면 토큰 사용 제안 (`prefer-design-token`)

기존 a11y 룰(`icon-button-has-aria-label`, `navigation-has-aria-label`, `avatar-has-alt-text`, `dialog-should-have-title`)과 동일한 패키지에 추가한다.

## 2. 범위 / 비범위

### 범위

- JS/TS/JSX/TSX 파일.
  검사 컨텍스트 4종:
  1. JSX `style` prop 객체 (값 문자열 + 숫자 리터럴, key 도 `--vapor-*` 선언 감지에 사용)
  2. Tagged template literal CSS body (`` css`...` ``, `` styled.div`...` ``, vanilla-extract `style({...})` 안의 string 등)
  3. 일반 string literal (`const x = 'var(--vapor-...)'`)
  4. JSX `className` 속성의 string / template literal
- 순수 CSS 파일 (`.css`).
  `@eslint/css` (ESLint 공식 CSS 언어 플러그인) 환경에서 동작하는 별도 룰 변형 제공:
  - `vapor/css/no-invalid-design-token`
  - `vapor/css/prefer-design-token`
  사용자는 flat config 에서 CSS 파일 블록에 `language: 'css/css'` 를 지정한 뒤 위 룰 활성화.
- 토큰 카테고리: `space`, `borderRadius`, `dimension`, `shadow`, `typography`, `color`(v1은 semantic-color 만).

### 비범위 (v1)

- `.scss`, `.sass`, `.less` 파일 (`@eslint/css` 미지원). 후속 마이너에서 검토.
- primitive-color (oklch 직접 정의) 의 raw-value 매칭.
- 토큰 → 토큰 변환 제안.
- autofix(--fix): suggestion API 만 제공.

## 3. 아키텍처

```
packages/eslint-plugin-vapor/
├── scripts/
│   └── extract-tokens.mjs              # build-time 토큰 추출 (NEW)
├── src/
│   ├── rules/
│   │   ├── no-invalid-design-token.ts  # NEW (JS/TS/JSX)
│   │   ├── prefer-design-token.ts      # NEW (JS/TS/JSX)
│   │   ├── css/
│   │   │   ├── no-invalid-design-token.ts  # NEW (@eslint/css 환경)
│   │   │   └── prefer-design-token.ts      # NEW (@eslint/css 환경)
│   │   ├── alt-text-on-avatar.ts
│   │   ├── aria-label-on-icon-button.ts
│   │   ├── aria-label-on-navigation.ts
│   │   └── should-have-title-on-dialog.ts
│   ├── utils/
│   │   ├── token-string.ts             # NEW: 문자열에서 --vapor-* 추출
│   │   ├── token-segment-distance.ts   # NEW: Damerau-Levenshtein
│   │   ├── property-category.ts        # NEW: CSS prop → token category
│   │   ├── style-context.ts            # NEW: JSX style obj / template / className walker (ESTree)
│   │   ├── allowlist.ts                # NEW: settings + 옵션 + 파일 로컬 union
│   │   ├── get-source.ts
│   │   └── guard.ts
│   ├── generated/
│   │   └── tokens.ts                   # GENERATED, .gitignore 대상
│   ├── types/
│   └── index.ts                        # 룰 등록 (JS + CSS) + recommended preset 갱신
└── package.json                        # prebuild 스크립트 + culori devDep
```

빌드 흐름:
1. `prebuild` npm script: `node scripts/extract-tokens.mjs` 실행 → `src/generated/tokens.ts` emit.
2. tsup이 src 전체(generated 포함) 번들. dist만 배포.
3. `src/generated/` 는 .gitignore. SSOT 는 skill assets JSON.

## 4. 토큰 추출 파이프라인 (`scripts/extract-tokens.mjs`)

### 입력

`packages/eslint-plugin-vapor/../../skills/token-lint/assets/*.json` (resolver.json 제외).

### 출력 형식 (`src/generated/tokens.ts`)

```ts
export type Category =
  | 'space'
  | 'borderRadius'
  | 'dimension'
  | 'shadow'
  | 'typography'
  | 'color';

export const CANONICAL_TOKENS: ReadonlySet<string> = new Set([
  '--vapor-size-space-100',
  '--vapor-size-borderRadius-400',
  // ...
]);

export const TOKEN_CATEGORY: Readonly<Record<string, Category>> = {
  '--vapor-size-space-100': 'space',
  // ...
};

export const VALUE_INDEX: Readonly<Record<Category, Record<string, string[]>>> = {
  space: { '8px': ['--vapor-size-space-100'] /* ... */ },
  borderRadius: { '12px': ['--vapor-size-borderRadius-400'] /* ... */ },
  dimension: { /* ... */ },
  shadow: { /* ... */ },
  typography: { /* ... */ },
  color: { '#3b82f6': ['--vapor-color-...'] /* ... */ },
};
```

### 처리 로직

1. **이름 추출**: 기존 skill의 `extract-tokens.mjs` (`scripts/extract-tokens.mjs`)에서 DTCG walk 로직 포팅 (PREFIX, DTCG_META_KEYS, TOP_KEY_REMAP 동일).
2. **카테고리 분류**: 파일명 기반 매핑
   - `space.json` → `space`
   - `border-radius.json` → `borderRadius`
   - `dimension.json` → `dimension`
   - `shadow.json` → `shadow`
   - `typography.json`, `text-style.json` → `typography`
   - `semantic-color.light.json` → `color`
   - primitive-color* → 이름은 CANONICAL_TOKENS에 포함하되 VALUE_INDEX 에는 제외 (v1).
3. **value index**:
   - space / borderRadius / dimension: `$value.value` + `$value.unit` → `"{N}px"`.
   - shadow: composite 토큰. v1은 정확히 한 가지 `box-shadow` 정규 표기로 직렬화한 후보만 entry. 후보 다수면 진입 보류.
   - typography: `fontSize` / `lineHeight` 등 각 sub-token 단일 값만 인덱싱. text-style 합성 토큰은 v1 제외 가능 (정확도 우선).
   - color: semantic-color.light.json 만 인덱싱.
     - ref 해석: `{colors.blue.100}` 같은 alias 를 primitive-color.light.json 의 oklch 정의로 추적.
     - oklch → hex 변환: `culori` 직접 사용. `formatHex({ mode: 'oklch', l, c, h })`.
     - 결과 hex 를 lower-case 6-digit 으로 정규화하여 key 사용.
4. **emit**: 위 3개 export 를 포함한 TS 파일 생성.

### 의존성

- `culori` 를 `devDependencies` 로 추가 (build 시점만 필요). 런타임 dist 에 포함되지 않음.

## 5. 룰: `no-invalid-design-token`

### 메시지

- `unknownToken`: `Unknown design token '{{ name }}'.`
- `unknownTokenWithSuggestions`: `Unknown design token '{{ name }}'. Did you mean: {{ suggestions }}?`

### 옵션 스키마

```ts
type Options = [{
  ignore?: string[];              // 정규식 패턴 배열 (string regex)
  allowCustomTokens?: string[];   // 토큰 이름 또는 glob (* 와일드카드)
  maxSuggestions?: number;        // 기본 3
}];
```

### 공유 settings (글로벌 allowlist)

ESLint config 의 최상위 `settings.vapor.customTokens` 를 통해 프로젝트 전역 커스텀 토큰을 등록한다. 다른 파일에서 `:root` 등에 선언된 `--vapor-*` 도 여기에 명시하면 모든 룰이 인식.

```js
// eslint.config.js
export default [{
  settings: {
    vapor: {
      customTokens: [
        '--vapor-app-sidebar-width',
        '--vapor-app-brand-*',     // glob 허용
      ],
    },
  },
}];
```

### 알고리즘

1. **Allowlist 구성** (`utils/allowlist.ts`):
   - L1 (global): `context.settings?.vapor?.customTokens` (string[] | undefined)
   - L2 (rule option): `options.allowCustomTokens`
   - L3 (file local): 사전 패스로 동일 파일에서 LHS 선언된 `--vapor-*`
     - JSX style obj key: `style={{ '--vapor-foo': value }}` 의 string key
     - Object literal property key: 동일
     - Template literal CSS body: 정규식 `(--vapor-[a-z0-9-]+)\s*:` 의 LHS
   - 세 집합 union → 검사 시 매칭(정확 일치 또는 glob 변환 regex)되면 skip.
2. **string/template 노드 방문** (`Literal`, `TemplateElement`):
   - 정규식 `/--vapor-[a-z0-9-]+/g` 로 토큰 후보 추출, 각 offset 기록.
   - `CANONICAL_TOKENS.has(name)` → skip.
   - Allowlist 매치 → skip.
   - `ignore` 정규식 매치 → skip.
   - 위 모두 해당 안되면 미존재 토큰: `segmentDistance` (per-segment ≤1, total ≤2) 로 후보 산출 → 상위 `maxSuggestions` 개.
3. **report**:
   - `loc`: 문자열 내부의 정확한 offset 으로 보정.
   - 후보 0 개 → `unknownToken`
   - 후보 ≥1 개 → `unknownTokenWithSuggestions`, `suggest` 배열에 각 후보 별 fix entry.
   - 각 suggestion fix: 원본 토큰 이름 범위만 후보 이름으로 치환 (string 내부 range 계산).

### 유틸

- `utils/token-segment-distance.ts`: skill 의 `damerauLevenshtein` + `segmentDistance` 포팅.

## 6. 룰: `prefer-design-token`

### 메시지

- `preferToken`: `Use design token instead of raw value. Candidate: {{ candidates }}.`

### 옵션 스키마

```ts
type Options = [{
  categories?: Array<'space'|'borderRadius'|'dimension'|'shadow'|'color'|'typography'>;
  propertyMap?: Record<string, Category>;
  ignoreProperties?: string[];
  ignoreValues?: string[];        // 기본 ['0', '0px', 'transparent', 'none']
  maxSuggestions?: number;        // 기본 3
}];
```

### CSS property → category 기본 매핑

```ts
const DEFAULT_PROPERTY_CATEGORY: Record<string, Category> = {
  // space
  gap: 'space',
  rowGap: 'space',
  columnGap: 'space',
  padding: 'space',
  paddingTop: 'space',
  paddingRight: 'space',
  paddingBottom: 'space',
  paddingLeft: 'space',
  paddingInline: 'space',
  paddingBlock: 'space',
  margin: 'space',
  marginTop: 'space',
  marginRight: 'space',
  marginBottom: 'space',
  marginLeft: 'space',
  marginInline: 'space',
  marginBlock: 'space',
  inset: 'space',
  top: 'space',
  right: 'space',
  bottom: 'space',
  left: 'space',
  // borderRadius
  borderRadius: 'borderRadius',
  borderTopLeftRadius: 'borderRadius',
  borderTopRightRadius: 'borderRadius',
  borderBottomLeftRadius: 'borderRadius',
  borderBottomRightRadius: 'borderRadius',
  // dimension
  width: 'dimension',
  height: 'dimension',
  minWidth: 'dimension',
  minHeight: 'dimension',
  maxWidth: 'dimension',
  maxHeight: 'dimension',
  size: 'dimension',
  // shadow
  boxShadow: 'shadow',
  // color (semantic only v1)
  color: 'color',
  background: 'color',
  backgroundColor: 'color',
  borderColor: 'color',
  borderTopColor: 'color',
  borderRightColor: 'color',
  borderBottomColor: 'color',
  borderLeftColor: 'color',
  outlineColor: 'color',
  fill: 'color',
  stroke: 'color',
  // typography
  fontSize: 'typography',
  lineHeight: 'typography',
  letterSpacing: 'typography',
  fontWeight: 'typography',
};
```

JSX 표기와 css 표기(`background-color` vs `backgroundColor`)는 모두 카멜케이스 키로 정규화한 뒤 매핑 조회.

### 값 정규화

- 숫자 리터럴 (`{ gap: 12 }`): React inline style 규칙대로 px 자동 추가 — 단 unitless property(`lineHeight`, `fontWeight`, `opacity`, `zIndex`, `flex`, `order`)는 px 변환 X, 그대로 string 화.
- 문자열 (`'12px'`, `'0.75rem'`): trim → 단위 포함 그대로.
- hex (`'#3B82F6'`, `'#3bf'`): 6자리 lower-case 로 확장 정규화.
- `rgb(...)`, `rgba(...)`, `hsl(...)`, named color(`'red'`): v1 매칭 보류 (skip). false-positive 위험 큼.

### 알고리즘

1. JSX style obj / CSS template literal / `css({...})` 호출 인자에서 (property, value) 쌍 추출.
2. property 정규화 (camelCase) → category 매핑 조회.
3. category 없음 → skip.
4. `ignoreProperties` 매치 → skip.
5. 값 정규화. `ignoreValues` 매치 → skip.
6. 이미 `var(--vapor-...)` 사용 중 → skip.
7. `VALUE_INDEX[category][normalizedValue]` 룩업.
8. 후보 ≥1 → `report` + 각 후보별 suggestion (값 노드를 `'var(--vapor-...)'` 로 치환). 숫자 리터럴 → 문자열 리터럴로 변환.

### 컨텍스트별 처리

- **JSX style obj**: `JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression`. Property iterate.
- **`css({...})` 호출**: callee가 식별자 `css` / `style` / `keyframes` / `globalStyle` 인 CallExpression. 인자 ObjectExpression 동일 처리.
- **Tagged template literal**: tag 가 `css` / `styled.X` / `styled(X)` 패턴. quasis 의 raw 문자열을 정규식으로 `prop: value;` 페어 추출 → 동일 매핑.
- **className**: 토큰 검사에만 사용 (`prefer-design-token` 대상 아님).

## 7. CSS 룰 변형 (`src/rules/css/*`)

`@eslint/css` 환경(`language: 'css/css'`)에서 동작. AST 가 CSSTree 기반이라 ESTree 룰과 코드 베이스 분리.

### 공유 자원

- `generated/tokens.ts` 의 `CANONICAL_TOKENS`, `TOKEN_CATEGORY`, `VALUE_INDEX` 재사용.
- `utils/token-segment-distance.ts`, `utils/property-category.ts`, `utils/allowlist.ts` 재사용 (CSS 컨텍스트에서도 동일 settings + option 키 사용).

### `vapor/css/no-invalid-design-token`

- 방문 노드: `Function` (CSS 함수 호출). `node.name === 'var'` 이면 첫 번째 `Identifier` 인자가 `--vapor-*` 패턴인지 검사.
- 추가로 `Declaration` 의 LHS (`property` 가 `--vapor-*`) 를 파일 로컬 allowlist 로 수집 (LHS 사전 패스).
- 매치 / suggest 로직은 JS 룰과 동일.

### `vapor/css/prefer-design-token`

- 방문 노드: `Declaration`.
- `property` → camelCase 정규화 후 `propertyCategory` 매핑 조회 (예: `border-radius` → `borderRadius`).
- `value` 의 첫 토큰 (Number + Dimension + Hash) 을 추출, 정규화 → `VALUE_INDEX` 룩업.
- 이미 `var(--vapor-...)` 사용 시 skip.
- 후보 발견 시 report + suggestion (declaration value 를 `var(--vapor-...)` 로 치환).

### peer 의존성

- `@eslint/css` 를 `peerDependencies` 의 optional 로 추가. flat config 사용자에게 README 안내.

## 8. 등록 / preset (`src/index.ts`)

```ts
import noInvalidDesignToken from './rules/no-invalid-design-token';
import preferDesignToken from './rules/prefer-design-token';
import cssNoInvalidDesignToken from './rules/css/no-invalid-design-token';
import cssPreferDesignToken from './rules/css/prefer-design-token';

const rules = {
    'icon-button-has-aria-label': ariaLabelOnIconButtonRule,
    'navigation-has-aria-label': ariaLabelOnNavigationRule,
    'avatar-has-alt-text': altTextOnAvatarRule,
    'dialog-should-have-title': shouldHaveTitleOnDialogRule,
    'no-invalid-design-token': noInvalidDesignToken,
    'prefer-design-token': preferDesignToken,
    'css/no-invalid-design-token': cssNoInvalidDesignToken,
    'css/prefer-design-token': cssPreferDesignToken,
} satisfies Record<string, Rule.RuleModule>;
```

recommended preset (JS/TS 파일 대상; CSS 룰은 사용자가 별도 활성화):
- 기존 a11y 룰 → `error`
- `vapor/no-invalid-design-token` → `error`
- `vapor/prefer-design-token` → `warn`

CSS recommended (별도 export `cssRecommended`):
- `vapor/css/no-invalid-design-token` → `error`
- `vapor/css/prefer-design-token` → `warn`

## 9. 테스트

`vitest` + ESLint `RuleTester` (기존 룰과 동일 패턴).

### 파일

- `src/rules/no-invalid-design-token.test.ts`
- `src/rules/prefer-design-token.test.ts`
- `src/rules/css/no-invalid-design-token.test.ts`
- `src/rules/css/prefer-design-token.test.ts`
- `src/utils/token-segment-distance.test.ts`
- `src/utils/property-category.test.ts`
- `src/utils/style-context.test.ts`
- `src/utils/allowlist.test.ts`

### `no-invalid-design-token` 핵심 케이스

valid:
- canonical 토큰 그대로 사용
- `--vapor-*` 미포함 string
- `allowCustomTokens: ['--vapor-app-*']` (옵션) 매치
- `settings.vapor.customTokens: ['--vapor-shared-color']` (글로벌) 매치
- 동일 파일 LHS 선언된 `--vapor-myown`

invalid:
- JSX style 안 1글자 오타 → suggest 1개, fix 적용 검증
- template literal 안 2글자 오타 → suggest 다수
- cutoff 초과한 완전히 잘못된 이름 → suggest 0개, report
- `ignore: ['^--vapor-temp-']` 매치 → skip

### `prefer-design-token` 핵심 케이스

valid:
- `style={{ gap: 'var(--vapor-size-space-100)' }}`
- category 미매핑 property
- `gap: 0`, `backgroundColor: 'transparent'`
- `ignoreProperties: ['fontSize']` 매치

invalid:
- `style={{ gap: 12 }}` → space token 제안 + suggestion 으로 `'var(--vapor-size-space-N)'`
- `style={{ gap: '12px' }}` → 동일
- `style={{ borderRadius: '4px' }}` → borderRadius 토큰
- `style={{ backgroundColor: '#3B82F6' }}` → semantic-color 후보 (hex 정규화 검증)
- `style={{ lineHeight: 1.5 }}` → unitless 정상 (px 변환 X)
- 다중 후보 → suggestion N개
- Tagged template ``css`gap: 12px;` `` → 감지

### CSS 룰 핵심 케이스

`vapor/css/no-invalid-design-token` valid:
- canonical 토큰 (`color: var(--vapor-color-foreground-primary);`)
- `:root { --vapor-app-foo: red; }` 동일 파일 LHS 선언 → 같은 파일에서 `var(--vapor-app-foo)` 사용 시 통과
- `settings.vapor.customTokens` 글로벌 등록 토큰

`vapor/css/no-invalid-design-token` invalid:
- 오타 토큰 `var(--vapor-color-foreground-primry)` → suggest

`vapor/css/prefer-design-token` valid:
- `gap: var(--vapor-size-space-100);`
- `gap: 0;`, `background: transparent;`

`vapor/css/prefer-design-token` invalid:
- `gap: 8px;` → space 토큰 제안
- `border-radius: 12px;` → borderRadius 토큰 (property kebab-case 정규화 검증)
- `background-color: #3b82f6;` → semantic-color 후보

## 10. 패키지 / 빌드 변경

`packages/eslint-plugin-vapor/package.json`:
- `scripts.prebuild`: `node scripts/extract-tokens.mjs`
- `scripts.build`: 기존 `tsup` 유지 (npm pre-hook 으로 prebuild 자동 실행)
- `scripts.dev`: `pnpm run prebuild && tsup --watch`
- `devDependencies`: `culori`, `@eslint/css` (CSS 룰 테스트용) 추가
- `peerDependenciesMeta.@eslint/css.optional = true` (CSS 룰만 쓸 때 필요)
- 버전 bump 는 changeset 으로 처리 (직접 수정 X)

`packages/eslint-plugin-vapor/.gitignore` (없으면 생성):
- `src/generated/`

`packages/eslint-plugin-vapor/README.md`:
- Rules 표에 신규 룰 4개 (JS 2 + CSS 2) + 옵션 예시 추가
- `settings.vapor.customTokens` 사용법 예시
- `@eslint/css` 연동 예시 (flat config 블록)
- 토큰 SSOT 위치 명시 (`skills/token-lint/assets`, build-time 추출)

CHANGELOG.md: 직접 작성하지 않음 (changesets 가 관리).

## 11. 단계별 구현 순서 (요약, plan 단계에서 상세화)

1. `scripts/extract-tokens.mjs` + `src/generated/tokens.ts` 생성 검증 (culori 통합 포함)
2. 공용 utils: `token-segment-distance.ts`, `property-category.ts`, `token-string.ts`, `allowlist.ts`, `style-context.ts`
3. JS 룰: `rules/no-invalid-design-token.ts` + 테스트
4. JS 룰: `rules/prefer-design-token.ts` + 테스트
5. CSS 룰: `rules/css/no-invalid-design-token.ts` + 테스트 (`@eslint/css` 환경)
6. CSS 룰: `rules/css/prefer-design-token.ts` + 테스트
7. `index.ts` 등록 + recommended / cssRecommended preset
8. README 갱신
9. 빌드 / lint / 타입체크 / 테스트 전체 통과 확인
