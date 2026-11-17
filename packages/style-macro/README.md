# @vapor-ui/style-macro

빌드 타임에 동작하는 zero-runtime CSS-in-JS. `css({...})` 호출 1개를 **class 1개 + CSS 블록 1개** 로 컴파일한다 (Vanilla Extract 와 같은 모델). `css()` 를 쓰는 모듈은 자기 CSS 만 import 하므로, 앱이 import 하지 않는 컴포넌트의 CSS 는 번들에 들어가지 않는다.

- 반환값은 순수 `string` — Server Component 에서 만들어 Client Component 로 넘겨도 된다.
- 블록 안 선언 순서는 작성 순서 그대로다. 같은 selector·property 는 뒤에 쓴 것이 이긴다. selector 그룹은 base → 중첩 selector(작성 순) → at-rule(`min-width` 오름 / `max-width` 내림) 순으로 나온다.
- `css(a, b)` 합성:
    - 같은 파일에서 정적으로 풀리는 인자(object 리터럴, 모듈 최상위 `const x = css(...)` / `const x = { ... }` 상수, 그 사이의 `&&` / `?:`)는 compile-time 에 **한 블록으로 병합**한다. 뒤 인자가 이기고, 조건부 조합은 분기마다 병합 블록을 미리 만든다(최대 16 조합).
    - 그 밖의 인자(import, props, 함수 결과)는 `_cx([...])` 로 이어붙인다. 같은 속성을 가진 두 class 의 승패는 CSS 로드 순서(import 순서)를 따른다.
    - 정적으로 풀리지 않는 인자 안에 스타일 객체가 값으로 올 수 있으면(`css(c || { ... })`, 한쪽 분기만 정적인 삼항) 빌드 에러다. 런타임에는 class 문자열만 있다. `css(c, !c && { ... })` 처럼 나눠 쓴다.

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

번들러 config. 지원 번들러는 Vite·webpack·Next(webpack·Turbopack)이고, 라이브러리 빌드는 Rolldown 이다 ([라이브러리 배포](#라이브러리-배포)). 그 밖의 번들러(Parcel 등)는 지원하지 않는다.

- **Vite (7·8)** — `css()` 를 쓰는 모듈마다 가상 CSS 모듈(`<file>.vapor.css`)을 만들고, 그 모듈이 자기 CSS 를 import 한다 (Vanilla Extract 와 같은 모델). import 되지 않는 모듈의 CSS 는 번들에 들어가지 않고, dev 에서는 수정한 모듈의 CSS 만 HMR 로 바뀐다. 레이어 순서를 고정하려면 앱 CSS 진입점에서 `@vapor-ui/core/layers.css` 를 **모든 `@vapor-ui/*` import 보다 먼저** import 한다.
- **webpack 5** — 같은 모델. 모듈마다 `@vapor-ui/style-macro/module.vapor.css?vapor-src=<모듈 경로>` 를 import 하고, 플러그인이 등록한 loader 가 그 자리에 모듈 CSS 를 넣는다. 이 요청은 앱의 `.css` 규칙(css-loader + style-loader / mini-css-extract-plugin, 또는 `experiments.css`)으로 처리되므로 앱에 `.css` 규칙이 있어야 한다.
- **Next (webpack · Turbopack)** — `vaporNextPlugin` 이 번들러를 감지해 배선한다. webpack 은 위와 같고, Turbopack 은 모듈마다 `./<file>?vapor-css` 를 import 하고 그 쿼리에 CSS loader 규칙(`as: '*.css'`)을 건다. 서버·클라이언트 컴포넌트 모두 라우트별 CSS 로 나뉘고 dev 에서 수정 즉시 반영된다. 레이어 순서는 루트 layout 이 import 하는 CSS 에서 `@vapor-ui/core/layers.css` 를 먼저 import 해 고정한다.

같은 레이어 안에서 서로 다른 모듈의 규칙끼리는 CSS 로드 순서가 승자를 정한다. 한 모듈 안의 `css()` 는 그 모듈이 import 한 라이브러리 CSS 뒤에 오므로 라이브러리 컴포넌트에 넘긴 override 가 이긴다. override 를 다른 모듈(공용 styles 파일, 다른 청크)에 두면 순서가 보장되지 않는다 — 라이브러리는 앱보다 앞선 레이어를 써야 한다 ([라이브러리 배포](#라이브러리-배포)).

```css
/* src/styles.css */
@import '@vapor-ui/core/layers.css'; /* 레이어 순서 — 모든 @vapor-ui/* import 보다 먼저 */
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

| Subpath                             | 용도                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `@vapor-ui/style-macro`             | 소비자용 `css()` + `buildColorSchemeScript()` + 타입                                               |
| `@vapor-ui/style-macro/vite`        | Vite plugin                                                                                        |
| `@vapor-ui/style-macro/webpack`     | Webpack plugin                                                                                     |
| `@vapor-ui/style-macro/next`        | Next.js plugin (webpack / turbopack 자동 감지)                                                     |
| `@vapor-ui/style-macro/rolldown`    | Rolldown plugin — 라이브러리 빌드. 컴포넌트별 CSS 를 배포 ([라이브러리 배포](#라이브러리-배포))    |
| `@vapor-ui/style-macro/turbopack`   | Turbopack loader (next plugin 이 내부 사용)                                                        |
| `@vapor-ui/style-macro/css-loader`  | webpack / Turbopack CSS loader — 소스 모듈을 모듈 CSS 로 컴파일 (webpack·next plugin 이 내부 사용) |
| `@vapor-ui/style-macro/__runtime__` | **내부용** — plugin 이 소비자 코드에 자동 inject. 직접 import 금지                                 |

## Plugin 옵션

```ts
interface VaporPluginOptions {
    include?: string[];
    exclude?: string[];
    root?: string;
    hash?: boolean;
    injectColorScheme?: boolean | ColorSchemeScriptOpts;
    layer?: string;
}
```

| 옵션                | 기본값                                  | 설명                                                                                                                                                                                     |
| ------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `include`           | `[]`                                    | 추가 대상 glob (`root` 기준, picomatch). 기본 대상(`root` 하위 JS/TS, `node_modules` 제외)에 **더해진다**. prebuilt 패키지 포함 예: `['node_modules/@acme/ui/dist/**']`                  |
| `exclude`           | `[]`                                    | 제외 glob (`root` 기준). `include` 보다 우선                                                                                                                                             |
| `root`              | 번들러 프로젝트 루트                    | `include`/`exclude` glob 기준 경로                                                                                                                                                       |
| `hash`              | `process.env.NODE_ENV === 'production'` | class name hash 모드 (readable vs hashed)                                                                                                                                                |
| `injectColorScheme` | `true`                                  | Vite `transformIndexHtml` 로 FOUC guard script 자동 주입. object 로 커스텀 가능                                                                                                          |
| `layer`             | `'vapor-utilities'`                     | `css()` 규칙을 담을 CSS cascade layer 이름 (`acme.ui` 같은 sub-layer 가능). CSS 진입점의 레이어 순서 선언에 포함돼야 한다 — 빠지면 브라우저가 맨 뒤 레이어로 취급해 앱 스타일까지 이긴다 |

## 라이브러리 배포

`css()` 를 쓰는 라이브러리는 빌드 시점에 매크로를 컴파일해 배포한다. 소비자는 플러그인도, 별도 CSS import 도 필요 없다 — 컴포넌트를 import 하면 그 컴포넌트의 CSS 가 함께 들어간다.

```ts
// rolldown.config.ts
import { vaporRolldownPlugin } from '@vapor-ui/style-macro/rolldown';

export default {
    input: { 'button/button': 'src/button/button.tsx' /* ... */ },
    plugins: [vaporRolldownPlugin({ hash: true, layer: 'acme-ui' })],
    output: { dir: 'dist', preserveModules: true, preserveModulesRoot: 'src' },
};
```

```jsonc
// package.json
{ "sideEffects": ["**/*.css"] }
```

- `css()` 를 쓰는 모듈마다 `<file>.vapor.css` (`<file>` 은 확장자 포함, 예: `button.tsx.vapor.css`)를 만들고, 그 모듈의 출력 파일이 import 하게 한다 (ESM `import`, CJS `require`). Vanilla Extract rollup plugin 과 같은 구조라 `preserveModules` 출력이 필요하다.
- 레이어 순서 선언(`@layer x;`)은 넣지 않는다. 순서는 소비자의 CSS 엔트리(`@vapor-ui/core/layers.css` 등)가 정한다.
- class 이름 해시에는 가장 가까운 `package.json` 의 `name` 과 그 패키지 기준 상대 경로가 들어간다. 다른 패키지와 class 가 겹치지 않는다.
- CJS 소비자는 서브패스(`acme-ui/button`)로 가져와야 컴포넌트 단위로 CSS 가 들어간다. CJS 루트 진입점은 모든 컴포넌트를 `require` 해 번들러가 걸러내지 못한다.
- `extract: true`(또는 `{ name: 'styles.css' }`)면 모듈별 CSS 대신 모든 CSS 를 import 순서대로 합친 파일 하나(기본 `index.css`)를 내보내고, 출력 JS 의 CSS import 를 지운다. 소비자가 그 파일을 직접 import 한다. `@vanilla-extract/rollup-plugin` 의 `extract` 와 같다.
- 각 모듈 CSS 는 external 모듈의 `meta.css` 에 실린다. 다른 rolldown 플러그인이 `this.getModuleInfo(id).meta.css` 로 읽어 후처리할 수 있다.
- 라이브러리는 앱과 다른 `layer` 를 주는 것을 권장한다. 같은 레이어를 쓰면 소비자가 라이브러리 컴포넌트에 넘긴 `className` override 의 성패가 CSS 로드 순서에 좌우된다. 라이브러리 레이어를 앱 레이어보다 앞에 선언하면 로드 순서와 무관하게 앱이 이긴다. `@vapor-ui/composites` 는 `vapor-composites` 레이어를 쓰고, `@vapor-ui/core/layers.css` 가 이를 `vapor-components` 와 `vapor-utilities` 사이에 선언한다.
- `hash: true` 로 고정한다. 기본값은 빌드 시점 `NODE_ENV` 를 따르므로, 고정하지 않으면 배포물의 class 이름이 빌드 환경에 따라 달라진다.

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

### 값 없음 (`null` / `undefined`)

`null` / `undefined` 리터럴은 선언을 만들지 않는다.

```ts
css({ color: undefined, width: '1px' }); // width 만
```

### 속성 이름 검사

컴파일러는 속성 이름을 검사하지 않는다(Compiled · React Spectrum style macro 와 같다). 오타는 TypeScript 가 `StyleObject` 타입으로 잡는다. 인라인 리터럴은 자동으로 검사되지만, 상수로 선언한 object 는 타입을 붙여야 검사된다.

```ts
import { css, type StyleObject } from '@vapor-ui/style-macro';

css({ colr: 'red' }); // ✗ TS: 'colr' does not exist in type 'StyleObject'

const base = { colr: 'red' }; // 타입 없음 → 검사 안 됨
const base = { colr: 'red' } satisfies StyleObject; // ✗ TS 에러
```

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
- CSS 값이 될 수 없는 리터럴: boolean, 정규식, BigInt, 배열, 함수, 클래스 (`invalid-value`)

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

| Code                  | 상황                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------- |
| `unknown-token`       | 토큰 이름이 해당 axis 에 없음                                                           |
| `scope-mismatch`      | 토큰이 다른 axis 소속                                                                   |
| `unknown-property`    | property 가 token scope 미지원 (shorthand 등)                                           |
| `invalid-input-shape` | 입력 shape 오류 (embedded `$token`, spread, 비정상 노드, 런타임에 도달하는 스타일 객체) |
| `dynamic-value`       | 식별자 property 에 dynamic 값, 삼항 분기에 dynamic 값                                   |
| `computed-key`        | computed key 사용                                                                       |
| `spread`              | spread element 사용                                                                     |
| `invalid-selector`    | nested selector 가 `:`/`::`/`@`/`[`/`&` 로 시작 안 함                                   |
| `invalid-value`       | boolean · 정규식 · BigInt · 배열 · 함수 · 클래스 리터럴 값                              |
| `mutated-constant`    | `css()` 에 병합된 object 상수를 변경함                                                  |
| `parse-error`         | 매크로를 import 한 파일의 문법 오류                                                     |

## 결정론

같은 입력 (`source`, `scope`, `hash`, `layer`) → 같은 출력 (`code`, `css`).

- Class name: hash = murmur2(`scope` + 블록 선언 직렬화). hashed `v<hash>`, readable `<변수·JSX 요소 이름>_<hash>`. `scope` 는 플러그인이 넘기는 root 기준 상대 경로라 빌드 머신과 무관하다. 같은 선언이라도 파일이 다르면 class 가 다르다.
- CSS: 블록은 소스 등장 순서, 블록 안은 selector 그룹 순서(위 참고).
- Shorthand: 자식 property 전개 순서 고정

## 내부 구조

| 모듈                           | 역할                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `src/compilers/transform.ts`   | AST 파싱, call site 수집, rule emit, 코드 재작성 (import 는 directive prologue 뒤에 삽입) |
| `src/compilers/parse-call.ts`  | 단일 `css({...})` 호출 파싱, IR rule 생성                                                 |
| `src/compilers/emit-css.ts`    | 블록(class + IR rule) → 모듈 CSS                                                          |
| `src/compilers/jsx-inject.ts`  | Dynamic value JSX `style` prop 주입                                                       |
| `src/models/*.ts`              | class name, selector, shorthand, token, value 모델                                        |
| `src/plugins/*.ts`             | 번들러 adapter (unplugin + turbopack loader)                                              |
| `src/models/sort.ts`           | 블록 안 at-rule 정렬 (Compiled 이식)                                                      |
| `src/helpers/cx.ts`            | runtime `_cx` — class 이어붙이기·중복 제거 (`__runtime__`)                                |
| `src/helpers/resolve-token.ts` | runtime `_resolveToken` helper (`__runtime__` subpath 로 노출)                            |

`transform(source, opts)` 는 public API 아님 — plugin 내부 전용.
