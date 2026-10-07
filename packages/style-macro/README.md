# @vapor-ui/style-macro

빌드 타임에 동작하는 atomic CSS-in-JS 유틸리티. `css({...})` 호출을 아토믹 classname과 CSS 청크로 변환.

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

번들러 config:

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

const withVapor = vaporNextPlugin({});
const nextConfig: NextConfig = {/* config options here */};

export default withVapor(nextConfig);
```

## Entry points

| Subpath                             | 용도                                                               |
| ----------------------------------- | ------------------------------------------------------------------ |
| `@vapor-ui/style-macro`             | 소비자용 `css()` + `buildColorSchemeScript()` + 타입               |
| `@vapor-ui/style-macro/vite`        | Vite plugin                                                        |
| `@vapor-ui/style-macro/webpack`     | Webpack plugin                                                     |
| `@vapor-ui/style-macro/next`        | Next.js plugin (webpack / turbopack 자동 감지)                     |
| `@vapor-ui/style-macro/rolldown`    | Rolldown plugin                                                    |
| `@vapor-ui/style-macro/turbopack`   | Turbopack loader (next plugin 이 내부 사용)                        |
| `@vapor-ui/style-macro/__runtime__` | **내부용** — plugin 이 소비자 코드에 자동 inject. 직접 import 금지 |

## Plugin 옵션

```ts
interface VaporPluginOptions {
    include?: (id: string) => boolean;
    hash?: boolean;
    themeStylesImport?: string | false;
    injectColorScheme?: boolean | ColorSchemeScriptOpts;
}
```

| 옵션                | 기본값                                               | 설명                                                                            |
| ------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| `include`           | `*.{ts,tsx,js,jsx,mts,mjs,cts,cjs}` − `node_modules` | 변환 대상 파일 필터                                                             |
| `hash`              | `process.env.NODE_ENV === 'production'`              | class name hash 모드 (readable vs hashed)                                       |
| `themeStylesImport` | `null`                                               | 각 파일에 side-effect CSS import 삽입 (예: `'@vapor-ui/core/styles.css'`)       |
| `injectColorScheme` | `true`                                               | Vite `transformIndexHtml` 로 FOUC guard script 자동 주입. object 로 커스텀 가능 |

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

Next.js (SSR) 에서 pre-hydration 테마 세팅:

```tsx
// app/layout.tsx
import { buildColorSchemeScript } from '@vapor-ui/style-macro';

const SCRIPT = buildColorSchemeScript({ defaultTheme: 'system' });

export default function Root({ children }) {
    return (
        <html>
            <head>
                <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
            </head>
            <body>{children}</body>
        </html>
    );
}
```

`buildColorSchemeScript` option:

| 옵션           | 기본값               | 설명                              |
| -------------- | -------------------- | --------------------------------- |
| `storageKey`   | `'vapor-ui-theme'`   | localStorage key                  |
| `attribute`    | `'data-vapor-theme'` | `<html>` attribute 이름           |
| `defaultTheme` | `'system'`           | `'light'` / `'dark'` / `'system'` |

Vite 는 `injectColorScheme` 옵션으로 자동 주입 (별도 설정 불필요).

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

- Class name: call site 에서 정렬 (static path)
- CSS: condition bucket 안에서 정렬
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
| `src/helpers/resolve-token.ts` | runtime `_resolveToken` helper (`__runtime__` subpath 로 노출) |

`transform(source, opts)` 는 public API 아님 — plugin 내부 전용.
