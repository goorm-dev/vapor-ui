# @vapor-ui/style-macro

빌드 타임에 동작하는 atomic CSS-in-JS 유틸리티. `css({...})` 호출을 아토믹 class 문자열로 치환하고, 프로젝트 전체의 룰을 모아 **단일 시트** 로 방출한다.

- 반환값은 순수 `string` — Server Component 에서 만들어 Client Component 로 넘겨도 된다.
- cascade 는 Compiled(Atlassian) 의 단일 시트 정렬을 따른다: shorthand < longhand < `:link/:visited/:focus-within/:focus/:focus-visible/:hover/:active` < at-rule(`min-width` 오름 / `max-width` 내림). 파일·청크 순서와 무관하게 한 파일의 `:hover`/`@media`/longhand 가 다른 파일의 base 를 이긴다.
- `css(a, b)` 합성은 `selector|property` 슬롯 단위 last-wins. 인자가 전부 정적이면 compile-time 에 끝나고, 런타임 값이 섞이면 `_ax([...])` 가 같은 규칙으로 머지한다 (외부 class 는 통과).

## 사용

소비자 코드:

```tsx
import { css } from '@vapor-ui/style-macro';

function Button() {
    return (
        <button
            className={css({
                padding: '$space-200',
                color: '$fg-primary',
                backgroundColor: '$bg-primary',
                ':hover': { backgroundColor: '$bg-secondary' },
            })}
        >
            Click
        </button>
    );
}
```

번들러 config. 프로젝트 전체 룰은 정렬된 시트 하나로 CSS 진입점에 들어간다. 삽입 지점은 둘 중 하나다.

1. `@import '@vapor-ui/core/layers.css'` — 이 import 가 있는 파일 끝에 붙는다. 기본 사용법 그대로면 추가 설정이 없다.
2. `@vapor-utilities;` — 직접 적은 자리에 치환된다. `layers.css` 를 생략하고 레이어 순서를 직접 선언할 때, 또는 PostCSS 에서 postcss-import 가 이 플러그인보다 먼저 돌 때 쓴다.

둘 다 없으면 스타일이 방출되지 않는다 (Vite/webpack 은 빌드 끝에, PostCSS 는 Vapor 레이어 순서를 선언한 파일에서 경고). 마커는 번들러가 직접 받는 CSS 진입점에 적는다 — `@import` 된 partial 안에 두면 보이지 않는다. 여러 파일에 적으면 시트가 그 수만큼 중복된다.

```css
/* src/styles.css */
@import '@vapor-ui/core/layers.css'; /* 삽입 트리거 */
@import '@vapor-ui/core/styles.css';
```

```ts
// vite.config.ts
import { vaporVitePlugin } from '@vapor-ui/style-macro/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [vaporVitePlugin(), react()],
});
```

```ts
// next.config.ts
import { vaporNextPlugin } from '@vapor-ui/style-macro/next';
import type { NextConfig } from 'next';

const withVapor = vaporNextPlugin();
const nextConfig: NextConfig = {/* config options here */};

export default withVapor(nextConfig);
```

## Entry points

| Subpath                             | 용도                                                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@vapor-ui/style-macro`             | 소비자용 `css()` + `buildColorSchemeScript()` + 타입                                                                                              |
| `@vapor-ui/style-macro/vite`        | Vite plugin                                                                                                                                       |
| `@vapor-ui/style-macro/webpack`     | Webpack plugin                                                                                                                                    |
| `@vapor-ui/style-macro/next`        | Next.js plugin (webpack / turbopack 자동 감지)                                                                                                    |
| `@vapor-ui/style-macro/rolldown`    | Rolldown plugin. 라이브러리 빌드는 `cssFileName` 으로 시트를 함께 배포 ([라이브러리 배포](#라이브러리-배포))                                      |
| `@vapor-ui/style-macro/turbopack`   | Turbopack loader (next plugin 이 내부 사용)                                                                                                       |
| `@vapor-ui/style-macro/css-loader`  | webpack / Turbopack CSS loader — `@vapor-utilities;` 치환 (next plugin 이 내부 사용)                                                              |
| `@vapor-ui/style-macro/postcss`     | PostCSS 플러그인 — 전용 어댑터 없는 번들러(rolldown, Parcel, 순수 webpack)용. postcss-import 보다 앞에 등록. Next 에서는 불필요, Turbopack 비호환 |
| `@vapor-ui/style-macro/__runtime__` | **내부용** — plugin 이 소비자 코드에 자동 inject. 직접 import 금지                                                                                |

## Plugin 옵션

```ts
interface VaporPluginOptions {
    include?: string[];
    exclude?: string[];
    root?: string;
    hash?: boolean;
    injectColorScheme?: boolean | ColorSchemeScriptOpts;
}
```

| 옵션                | 기본값                                  | 설명                                                                                                                                                                                     |
| ------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `include`           | `[]`                                    | 추가 대상 glob (`root` 기준, picomatch). 기본 대상(`root` 하위 JS/TS, `node_modules` 제외)에 **더해진다**. prebuilt 패키지 포함 예: `['node_modules/@acme/ui/dist/**']`                  |
| `exclude`           | `[]`                                    | 제외 glob (`root` 기준). `include` 보다 우선                                                                                                                                             |
| `root`              | `process.cwd()`                         | 스캔 루트 · glob 기준 경로                                                                                                                                                               |
| `hash`              | `process.env.NODE_ENV === 'production'` | class name hash 모드 (readable vs hashed)                                                                                                                                                |
| `injectColorScheme` | `true`                                  | Vite `transformIndexHtml` 로 FOUC guard script 자동 주입. object 로 커스텀 가능                                                                                                          |

## 라이브러리 배포

`css()` 를 쓰는 라이브러리는 빌드 시점에 매크로를 컴파일해 배포한다. 소비자는 플러그인 없이 시트 하나만 import 한다.

```ts
// rolldown.config.ts
import { vaporRolldownPlugin } from '@vapor-ui/style-macro/rolldown';

export default {
    plugins: [vaporRolldownPlugin({ hash: true, cssFileName: 'styles.css' })],
};
```

- `cssFileName` 을 지정하면 번들에 포함된 모듈의 룰을 모아 `@layer vapor-utilities` 단일 정렬 시트 하나로 방출한다. 번들에 들어가지 않은 파일(stories, test 등)은 제외한다.
- `hash: true` 로 고정한다. 기본값은 빌드 시점 `NODE_ENV` 를 따르므로, 고정하지 않으면 배포물의 class 이름이 빌드 환경에 따라 달라진다.
- 출력 포맷이 여러 개(ESM + CJS)여도 룰은 같으므로 한 빌드에서만 `cssFileName` 을 준다.

## 지원하는 값

### 토큰 참조

```ts
css({ color: '$fg-primary' }); // ✓ axis 매치
css({ backgroundColor: '$bg-primary' }); // ✓ axis 매치
css({ padding: '$space-200' }); // ✓ shorthand expansion
```

### 중첩 selector

```ts
css({
    color: '$fg-primary',
    ':hover': { color: '$fg-secondary' },
    '::before': { content: '"→"' },
    '@media (min-width: 768px)': { padding: '$space-400' },
    '&.selected': { backgroundColor: '$bg-primary' },
    '[data-active="true"]': { opacity: 1 },
});
```

### Entry-level 삼항

```ts
css({
    color: isActive ? '$fg-primary' : '$fg-secondary',
    padding: compact ? '$space-100' : '$space-400',
});
```

양 분기 모두 리터럴/토큰이어야 함. 다중 삼항 지원.

### Dynamic value

```ts
function C({ color }: { color: string }) {
    return <div className={css({ color })} />;
}
```

Runtime 에 `_resolveToken(property, value)` 호출 + inline `style={{ '--slot': ... }}` 자동 주입.

## 지원 안 하는 값

### Shorthand property + 토큰

shorthand 속성은 token scope가 없음.

```ts
css({ background: '$bg-primary' }); // ✗ unknown-property
css({ border: '1px solid $basic-black' }); // ✗ invalid-input-shape (embedded)
```

→ 전용 sub-property로 작성할 것:

```ts
css({ backgroundColor: '$bg-primary' });
css({ borderWidth: '1px', borderStyle: 'solid', borderColor: '$basic-black' });
```

### 기타 금지

- Spread elements (`...rest`)
- Computed keys (`[key]`)
- Identifier property 의 dynamic value (`animation-name`, `content` 등)
- 삼항 분기 안 dynamic value (`cond ? var1 : '$a'` X)

## FOUC guard

pre-hydration 시점에 `<html>` 에 theme attribute 를 세팅해 light↔dark flash 를 차단.

### 자동 주입 (Vite / Webpack)

`injectColorScheme` 옵션 (default `true`) 으로 번들러가 `<head>` 에 inline `<script>` 자동 삽입.

- Vite — `transformIndexHtml` hook
- Webpack — `html-webpack-plugin` 의 `beforeEmit` hook (미설치 시 no-op)

### 수동 주입 (Next.js / 프레임워크 기본 HTML 사용 불가 환경)

Next.js App Router 는 `<html>` 를 번들러가 아닌 React 가 렌더링하기 때문에 자동 주입이 불가능. layout 에서 직접 삽입.

```tsx
// app/layout.tsx
import { buildColorSchemeScript } from '@vapor-ui/style-macro';

const SCRIPT = buildColorSchemeScript({ defaultTheme: 'system' });

export default function Root({ children }) {
    return (
        <html suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
            </head>
            <body>{children}</body>
        </html>
    );
}
```

`suppressHydrationWarning` 는 반드시 `<html>` 에만 지정. inline script 가 `<html>` 에 `data-vapor-theme` attribute 를 추가하면 server markup (attribute 없음) 과 client DOM (attribute 있음) 이 달라져 React 가 hydration warning 을 띄움. 이 flag 는 해당 element **한 depth** 의 attribute mismatch 만 억제하고 children 에는 전파하지 않아 안전.

### `buildColorSchemeScript` option

| 옵션           | 기본값               | 설명                              |
| -------------- | -------------------- | --------------------------------- |
| `storageKey`   | `'vapor-ui-theme'`   | localStorage key                  |
| `attribute`    | `'data-vapor-theme'` | `<html>` attribute 이름           |
| `defaultTheme` | `'system'`           | `'light'` / `'dark'` / `'system'` |

## Error 코드

| Code                  | 상황                                                     |
| --------------------- | -------------------------------------------------------- |
| `unknown-token`       | 토큰 이름이 해당 axis 에 없음                            |
| `scope-mismatch`      | 토큰이 다른 axis 소속                                    |
| `unknown-property`    | property 가 token scope 미지원 (shorthand 등)            |
| `invalid-input-shape` | 입력 shape 오류 (embedded `$token`, spread, 비정상 노드) |
| `dynamic-value`       | 식별자 property 에 dynamic 값, 삼항 분기에 dynamic 값    |
| `computed-key`        | computed key 사용                                        |
| `spread`              | spread element 사용                                      |
| `invalid-selector`    | nested selector 가 `:`/`::`/`@`/`[`/`&` 로 시작 안 함    |

## 결정론

같은 입력 (`source`, `hash` 모드) → 같은 출력 (`code`, `css`, `classes`).

- Class name: `_<group6><value6>` — group = hash(selector|property), value = hash(value). dev 는 앞에 읽을 수 있는 slug 가 붙지만 끝 12자는 동일해 `_ax` 키가 일치한다.
- CSS: bucket(shorthand 깊이 → base → LVFHA → at-rule) → at-rule 비교 → 입력 순서. 수집 모드에서는 프로젝트 전체가 한 번에 정렬된다.
- Shorthand: 자식 property 전개 순서 고정

## 내부 구조

| 모듈                           | 역할                                                           |
| ------------------------------ | -------------------------------------------------------------- |
| `src/compilers/transform.ts`   | AST 파싱, call site 수집, rule emit, 코드 재작성               |
| `src/compilers/parse-call.ts`  | 단일 `css({...})` 호출 파싱, IR rule 생성                      |
| `src/compilers/emit-css.ts`    | IR rule → CSS 문자열 변환                                      |
| `src/compilers/jsx-inject.ts`  | Dynamic value JSX `style` prop 주입                            |
| `src/compilers/directives.ts`  | `'use client'` directive 보존 (import 삽입 위치 결정)          |
| `src/models/*.ts`              | class name, selector, shorthand, token, value 모델             |
| `src/plugins/*.ts`             | 번들러 adapter (unplugin + turbopack loader)                   |
| `src/models/sort.ts`           | cascade bucket · at-rule 정렬 (Compiled 이식)                  |
| `src/plugins/_collect.ts`      | 소스 스캔 → 전체 IR → 단일 `emitCss`                           |
| `src/helpers/ax.ts`            | runtime `_ax` — group 단위 class 머지 (`__runtime__`)          |
| `src/helpers/resolve-token.ts` | runtime `_resolveToken` helper (`__runtime__` subpath 로 노출) |

`transform(source, opts)` 는 public API 아님 — plugin 내부 전용.
