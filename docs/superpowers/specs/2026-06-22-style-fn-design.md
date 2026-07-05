# `$style` 함수 설계

- 작성일: 2026-06-22
- 상태: Draft (brainstorming 합의 단계 종료, 구현 계획 작성 전)
- 범위: `@vapor-ui/core`의 신규 유틸리티 CSS API `$style` 도입 + 기존 `$css` prop 점진적 deprecate
- 비-목표: 컴포넌트 recipe 시스템 개편, 토큰 패키지 구조 변경

## 1. 배경과 문제

현 디자인 시스템은 컴포넌트 스타일 커스터마이즈 채널로 `$css` prop을 제공한다. 구현은 `rainbow-sprinkles`(`vanilla-extract`의 `sprinkles` 래퍼)로, 모든 CSS 속성 × 모든 토큰 값을 atomic class로 **prebuild**해 두고 사용자 입력 시 클래스 합성/CSS Variable 주입으로 매핑한다.

이 모델의 한계:

- **prebuild 매트릭스 폭증**: 지원 속성이 늘거나 토큰이 추가되면 atomic CSS 파일이 사용량과 무관하게 커진다.
- **컴포넌트 prop 표면 비대**: deprecated된 평면 prop들(`padding`, `margin`, `width` 등)이 `$css`와 공존하는 동안 prop API가 무거워진다.
- **사용자 확장 어려움**: 브레이크포인트, 컨디션 등을 소비자가 바꾸기 어렵다.

## 2. 목표

- 빌드 타임에 동작하는 **신규 `$style` 함수** 도입.
- 호출 인자를 정적 분석해 **실제 사용된 (속성, 값, 조건) 조합에 한해서만** atomic CSS를 emit. prebuild 매트릭스 제거.
- 기본 CSS 속성과 디자인 토큰을 모두 지원하며, 토큰은 기존 `$css`와 동일한 `$<token-name>` grammar 유지.
- 반응형은 객체 형태(`default`/`sm`/`md`/`lg`/raw `@media (...)` 키)로 지정 가능.
- 명명 브레이크포인트는 **소비자 측 PostCSS로 override 가능**.
- SSR 안전. React Server Component 호환. 런타임 0 (Provider/context/effect 없음).
- Next.js + Vite를 v1 지원 범위로 한다.

## 3. 비-목표 (v1)

- Condition-first 중첩 표기 (`{ _hover: { ... } }`). value-first 단독.
- 소비자 정의 custom condition (`_checked`, `_disabled`, data-attr selector 등).
- S2 스타일의 런타임 분기 함수 반환 (`style(...)(conditions)`).
- Class 이름 minify (v2 후보).
- SWC native plugin (v1은 Babel/unplugin only).
- Turbopack 대응 (S2와 동일 한계). Next 16+ 사용자는 `--webpack` 강제.
- 자동 codemod의 spread/dynamic-object 케이스 처리.

## 4. Public API

### 4.1 시그니처

```ts
$style(input: StyleInput): string
```

반환은 항상 `string` (className). `style` 속성 주입 없음. 컴포넌트는 `className`을 통해서만 적용한다.

### 4.2 사용 예

```tsx
import { $style } from '@vapor-ui/core';

// 정적
<Box className={$style({ padding: '$400', backgroundColor: '$bg-gray-100' })} />

// 정적 ternary (양 분기 모두 정적 분석 가능)
<Box className={$style({
    padding: '$400',
    backgroundColor: isActive ? '$primary' : '$bg-gray-100',
})} />

// 반응형 (value-first)
<Box className={$style({
    padding: { default: '$200', sm: '$100', md: '$400' },
})} />

// Raw @media 키
<Button className={$style({
    padding: {
        default: '$200',
        lg: '$300',
        '@media (min-width: 2560px)': '$400',
    },
})} />

// Pseudo state
<Button className={$style({
    backgroundColor: { default: '$primary', _hover: '$primary-hover' },
})} />

// 혼합
<Box className={$style({
    padding: { default: '$200', sm: '$100' },
    color: isActive ? '$primary' : { default: '$gray-700', _hover: '$gray-900' },
})} />
```

### 4.3 토큰 grammar

- `$` prefix 필수. `$400`, `$bg-gray-100`, `$primary`.
- 속성별 토큰 스코프(`backgroundColor` → color 토큰, `padding`/`gap` → space 토큰, `width`/`height` → dimension 토큰, …). 잘못된 매칭은 타입 + 빌드 에러.
- 리터럴 CSS 값(`'flex'`, `0`, `'1rem'`)은 그대로 허용.

### 4.4 값 제약 (빌드 타임 강제)

`$style` 인자는 매크로가 정적 분석한다. 허용되는 형태:

- 객체 리터럴 (computed key 금지)
- 키: CSS 속성명, 또는 condition key (`default` / `sm` / `md` / `lg` / `_<pseudo>` / `'@media (...)'`)
- 값: 리터럴(string/number), 토큰 문자열(`$...`), 또는 ternary(양 분기 모두 위 규칙 만족)

거부 케이스(빌드 에러 + codeframe):

- 변수 참조, 함수 호출, spread, computed key, 식별자 아닌 분기
- 알 수 없는 토큰 / 속성-토큰 미스매치
- ternary 분기 한쪽이 동적 표현인 경우

### 4.5 중첩 모양

Value-first 단독 (`{ backgroundColor: { default: ..., _hover: ..., sm: ... } }`). condition-first 미지원.

## 5. Condition system

### 5.1 키 종류

| 키                                                                                        | 의미                | override 가능        |
| ----------------------------------------------------------------------------------------- | ------------------- | -------------------- |
| `default`                                                                                 | 조건 없음 (base)    | -                    |
| `sm` / `md` / `lg`                                                                        | 명명 브레이크포인트 | PostCSS로 가능       |
| `_before` / `_after` / `_hover` / `_focus` / `_focusVisible` / `_focusWithin` / `_active` | Pseudo selector     | 불가                 |
| `'@media (<any-query>)'`                                                                  | Raw media query     | 불가 (의도된 일회성) |

매크로 키 구분 규칙: `default` → unconditional, `_` prefix → pseudo, `@media ` prefix → raw media, 기타 식별자 → named BP.

### 5.2 명명 BP override

패키지 산출 CSS 상단에 `@custom-media` 선언을 emit:

```css
@custom-media --vapor-sm (max-width: 767px);
@custom-media --vapor-md (max-width: 1024px);
@custom-media --vapor-lg (min-width: 1025px);
```

소비자는 `postcss-custom-media`로 override. 편의를 위해 `@vapor-ui/core/postcss` 헬퍼 1개 노출:

```js
// postcss.config.js
import { vaporCustomMedia } from '@vapor-ui/core/postcss';

export default {
    plugins: [
        vaporCustomMedia({
            sm: '(max-width: 640px)',
            md: '(max-width: 960px)',
            lg: '(min-width: 961px)',
        }),
    ],
};
```

내부적으로 `postcss-custom-media`를 wrap하고 BP 이름 strict 검증.

### 5.3 Raw `@media` 처리

매크로가 query 문자열을 정규화(대소문자/공백 트림) 후 8-char hash 키로 atomic class를 합성한다. 같은 query는 같은 hash → 재사용.

## 6. Atomic class 합성

### 6.1 이름 규칙

```
_<conditionPrefix>-<propertyShort>-<valueShort>

예:
_p-400                       // padding $400
_bg-primary                  // backgroundColor $primary
_sm-p-100                    // sm: padding $100
_hover-bg-primary-hover      // _hover: backgroundColor $primary-hover
_mq3a7f9-p-400               // @media (min-width: 2560px): padding $400
```

- `propertyShort`: 사전 정의된 단축 테이블 (`padding` → `p`, `backgroundColor` → `bg` 등).
- `valueShort`: 토큰명에서 `$` 제거(`$400` → `400`, `$bg-gray-100` → `bg-gray-100`).
- `conditionPrefix`: `sm`/`md`/`lg`/`hover`/`focus`/.../`mq<hash6>`. 없으면 생략.
- 충돌 회피용 `_` prefix 고정.

이름은 content 기반이고 선언 위치 무관 → 호출 사이트가 같은 (속성, 값, 조건) 튜플을 쓰면 같은 class 재사용.

### 6.2 CSS 산출 예

```tsx
<Box
    className={$style({
        padding: { default: '$200', sm: '$100', '@media (min-width: 2560px)': '$400' },
        backgroundColor: '$primary',
        color: { default: '$gray-700', _hover: '$gray-900' },
    })}
/>
```

→

```css
@custom-media --vapor-sm (max-width: 767px);

@layer vapor.utilities {
    ._p-200 {
        padding: var(--vapor-size-space-200);
    }
    ._bg-primary {
        background-color: var(--vapor-color-primary);
    }
    ._color-gray-700 {
        color: var(--vapor-color-gray-700);
    }

    @media (--vapor-sm) {
        ._sm-p-100 {
            padding: var(--vapor-size-space-100);
        }
    }
    @media (min-width: 2560px) {
        ._mq-<hash > -p-400 {
            padding: var(--vapor-size-space-400);
        }
    }
    ._hover-color-gray-900:hover {
        color: var(--vapor-color-gray-900);
    }
}
```

호출부는 다음과 같이 치환된다:

```tsx
<Box
    className={
        '_p-200 _sm-p-100 _mq-<hash>-p-400 _bg-primary _color-gray-700 _hover-color-gray-900'
    }
/>
```

### 6.3 Emit order (cascade 결정성)

같은 `@layer vapor.utilities` 안에서 source order로 다음 규칙으로 emit한다:

1. `default`
2. 명명 BP: `sm` → `md` → `lg`
3. Raw `@media`: query 문자열 사전순
4. Pseudo: `_before` → `_after` → `_focus` → `_focusVisible` → `_focusWithin` → `_hover` → `_active` (LVFHA — focus before hover for accessibility, hover ring must not override focus ring)

매크로가 항상 이 순서로 emit → 동일 입력 → 동일 CSS 바이트.

### 6.4 캐싱

- **Atomic class 중복 제거**: 같은 튜플 → 같은 class. 프로젝트 전체 unique 튜플 수만큼 emit.
- **Per-file transform 캐시**: 매크로가 순수 함수. 번들러의 persistent cache가 변경 없는 파일을 재transform 안 함.
- **CSS stable hash**: 동일 atomic set → 동일 CSS 바이트 → 번들러 content hash 안정 → 장기 캐시.
- **HMR**: 파일 변경 시 atomic set diff만 반영.

## 7. Build pipeline

### 7.1 패키지 구조

- `@vapor-ui/core` — `$style` export. 런타임은 type-only, 빌드 후 매크로가 호출부를 치환.
- `@vapor-ui/style-macro` — `unplugin` 기반 매크로 단일 코어. webpack/vite/rollup/esbuild adapter 자동 노출.

매크로를 별도 패키지로 분리해 unplugin 의존성이 `@vapor-ui/core` 런타임 의존성으로 새지 않도록 한다.

### 7.2 매크로 책임

1. `@vapor-ui/core`에서 `$style` import한 식별자 binding 추적.
2. 호출 인자 AST 정적 분석 (§4.4 제약).
3. atomic class 이름 합성 (§6.1).
4. CSS chunk를 in-memory 가상 모듈 `macro-<contentHash>.css`로 emit + 변환 모듈 상단에 `import 'macro-<contentHash>.css'` 자동 주입.
5. unplugin이 `resolveId`/`load`에서 가상 모듈을 응답 → 번들러 CSS 파이프라인이 처리.
6. 빌드 에러는 babel-codeframe 형식으로 보고.
7. 토큰 매핑 테이블은 `@vapor-ui/core`의 token 정의를 참조 (단일 출처).

### 7.3 Next.js 통합

```ts
// next.config.ts
import vaporStyleMacro from '@vapor-ui/style-macro';

const plugin = vaporStyleMacro.webpack();

export default {
    webpack(config) {
        config.plugins.push(plugin);
        config.optimization.splitChunks ||= {};
        config.optimization.splitChunks.cacheGroups ||= {};
        config.optimization.splitChunks.cacheGroups.vaporStyle = {
            name: 'vapor-style',
            test: (m) =>
                m.type === 'css/mini-extract' &&
                (m.identifier().includes('@vapor-ui/core') ||
                    /macro-(.*?)\.css/.test(m.identifier())),
            chunks: 'all',
            enforce: true,
        };
        return config;
    },
};
```

- atomic CSS는 페이지 간 중복이 많아 splitChunks로 단일 청크가 더 작다.
- Turbopack 미지원. Next 16+는 `--webpack` flag 강제 (S2와 동일).
- 사용자는 별도 CSS import 작성 안 함. 매크로가 변환 모듈에 자동 주입한 가상 모듈을 webpack이 그래프에 편입한다.

### 7.4 Vite 통합

```ts
// vite.config.ts
import vaporStyleMacro from '@vapor-ui/style-macro';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [vaporStyleMacro.vite()],
    build: {
        cssMinify: 'lightningcss',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (/macro-(.*)\.css$/.test(id) || /@vapor-ui\/core\/.*\.css$/.test(id)) {
                        return 'vapor-style';
                    }
                },
            },
        },
    },
});
```

### 7.5 기타 번들러

unplugin이 `.rollup()`, `.esbuild()`, `.webpack()`를 그대로 노출 → Storybook(Vite), Rollup, Webpack 직접 사용 환경 자동 지원.

## 8. Runtime + SSR

- 런타임 0. Provider/context/effect 없음. 빌드 후 호출은 literal string concat 또는 ternary 표현으로 치환된다.
- SSR/CSR 출력 동일 → hydration mismatch 없음.
- React Server Component 호환. RSC 안에서도 사용 가능하되, ternary 분기 양쪽이 모두 정적 표현이어야 함 (§4.4).
- Next의 critical CSS 최적화, Vite의 `ssrEmitAssets` 정상 작동 (정적 stylesheet).
- HMR: 매크로 transform이 변경된 파일만 재실행 → 새 atomic class 발견 시 가상 CSS 모듈 hash 갱신 → 번들러 HMR.
- 다중 인스턴스/모노레포: atomic class 이름이 deterministic → `@vapor-ui/style-macro` 인스턴스가 여러 dependency tree에 존재해도 출력 동일.

## 9. 기존 `$css`와의 공존 / 마이그레이션

| Phase     | 버전                   | 작업                                                                                                        | 사용자 영향                                 |
| --------- | ---------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1. 도입   | minor (예: 1.4.0)      | `$style` + `@vapor-ui/style-macro` 출시. `$css`에 `@deprecated` JSDoc. 문서/Storybook 신규 예제             | 변경 강제 없음. 신규 코드부터 `$style` 권장 |
| 2. 안정화 | 후속 patches           | 토큰 타입 확정, codemod 검증, 통합 이슈 fix                                                                 | -                                           |
| 3. 경고   | minor (예: 1.7.0)      | `$css` 사용 시 dev 모드 1회 console.warn. codemod 공식 릴리스                                               | warn 노출. 동작 동일                        |
| 4. 제거   | next major (예: 2.0.0) | `$css` prop 제거, `Sprinkles` 타입 제거, `rainbow-sprinkles` peer/dep 제거, atomic prebuild CSS 산출물 제거 | 마이그레이션 필수                           |

### 9.1 Codemod (`packages/codemod`)

```bash
npx @vapor-ui/codemod css-to-style src/
```

- AST 변환: `<X $css={{...}}/>` → `<X className={$style({...})} />`.
- 기존 `className` 있으면 template-literal 또는 `clsx`로 합성.
- 평면 deprecated props(`padding`, `margin`, …)는 같은 호출에 통합.
- 변환 불가 케이스(동적 객체 spread, 변수 참조 등)는 변환 스킵 + 경고 + 위치 리포트.

### 9.2 호환 보장

- Phase 1~3 동안 `$css` 동작 100% 유지.
- 그동안 CSS bundle 사이즈는 두 시스템 공존으로 즉시 줄지 않는다. 실제 절감은 Phase 4 이후.

### 9.3 내부 컴포넌트

- `@vapor-ui/core` 내부 컴포넌트는 recipe 위주 → `$css` 직접 사용 거의 없음. 영향 작음.
- `resolveStyles`/`mergeProps` 경로는 Phase 4까지 그대로.

### 9.4 Breaking change (2.0)

- `$css` prop 제거.
- 컴포넌트 평면 deprecated props 제거.
- `Sprinkles` 타입 export 제거.
- `rainbow-sprinkles` peer dependency 제거.
- `dist/styles/sprinkles.css.ts.vanilla.css` 산출물 제거 (theme/token CSS는 유지).

## 10. 검증 / 테스트 전략

- 매크로 단위: vitest fixture로 (input AST → output JS + CSS snapshot) 모든 condition 조합과 거부 케이스 커버.
- 통합: `apps/storybook` (Vite) 및 `apps/website` (Next) 양쪽에서 실 빌드 → 산출 CSS 검증 + 시각 회귀 (기존 Playwright config 재활용).
- 토큰 매핑: `@vapor-ui/core`의 token 정의 변경 시 매크로 매핑 테이블 동기화 테스트.
- 캐시: 동일 소스 두 번 빌드 시 CSS 산출 byte-identical 단위 테스트.
- SSR: Next App Router 샘플 페이지 + RSC 안 사용 사례 검증.

## 11. Open question (현재 잠금된 결정, 향후 재검토 여지)

- 토큰 prefix `$` 필수 (재검토 가능).
- BP 이름 `sm` / `md` / `lg` 고정 (`xl` 등 추가는 명명 BP 확장 작업으로 별도).
- `propertyShort` 단축 테이블 구성 (구현 시 확정).

## 12. 다음 단계

- 본 spec 사용자 검토.
- 승인 후 `writing-plans` skill 호출로 implementation plan 작성.
