# style-macro TODO

## SSR / FOUC

- [ ] **Dark 모드 pre-hydration FOUC 방지 (plugin builder 경유)**
    - 현상
        - Light 기본: `packages/core/src/styles/themes.css.ts:44` 에서 `:root, [data-vapor-theme='light']` 로 토큰 선언 → SSR HTML 파싱 시점부터 light 토큰 적용, FOUC 없음.
        - Dark: `[data-vapor-theme='dark']` 셀렉터에만 매핑. localStorage 저장값 dark / `defaultTheme='dark'` / `defaultTheme='system'` + OS dark 인 경우 SSR light → hydration 후 `useEffect(applyTheme)` (`packages/core/src/components/theme-provider/theme-provider.tsx:271`) 에서 dark 전환 → flash 발생.
    - 접근: `next-themes` 패턴. `<head>` 안에 blocking inline script 주입 → hydration 이전에 `document.documentElement.setAttribute('data-vapor-theme', resolved)` 수행.
    - 주입 지점 (bundler adapter 별):
        - Next adapter (`src/adapters/next.ts`) — App Router `<head>` 자동 주입, RSC 호환 확인.
        - Vite adapter (`src/adapters/vite.ts`) — `transformIndexHtml` hook.
        - Webpack / Rspack adapter — HtmlWebpackPlugin `alterAssetTags` tap.
        - Rollup / Rolldown / esbuild / Farm — 각 HTML output hook 확인.
    - 스크립트 로직
        1. `localStorage.getItem(storageKey)` 조회.
        2. 값 `'system'` 또는 null 이면 `matchMedia('(prefers-color-scheme: dark)')` 평가.
        3. `document.documentElement.setAttribute('data-vapor-theme', resolved)`.
        4. `enableColorScheme` 옵션 true 이면 `style.colorScheme` 도 set.
    - Plugin option 노출 필요: `storageKey`, `defaultTheme`, `forcedTheme`, `enableColorScheme`, `nonce`. ThemeProvider prop 과 값 일치 안 하면 hydration mismatch → 문서화 + 가능하면 build-time validation.
    - CSP: `nonce` prop 전파. Next.js `headers()` nonce 와 연동 방법 검토.
    - `disableTransitionOnChange` 는 pre-hydration 시점에는 무관, hydration 후 theme 변경에만 적용.

- [ ] **Hydration mismatch 방지**
    - `<html>` attribute 를 script 로 mutate 하므로 React hydration warning 가능성. `suppressHydrationWarning` 을 `<html>` 에 부여하도록 docs 안내 or codemod.

## Compiler / TransformOpts roadmap

`packages/style-macro/src/compiler/transform.ts:69` 주석 반영. 지금 refactor scope 밖. `TransformOpts` shape 일관성 유지 위해 landing 시점 미리 정리.

- [ ] **`prefix?: string`** — class-name prefix. multi-tenant / embed 시나리오 대응.
- [ ] **`lightningcss?: boolean`** — 생성 CSS 를 Lightning CSS 로 파이핑. nesting / autoprefix 처리.
- [ ] **`minify?: boolean`** — emitted CSS minify.
