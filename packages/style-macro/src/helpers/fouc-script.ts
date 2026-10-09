// Color-scheme FOUC guard. 브라우저 렌더 전에 실행되어 `<html>` 에 theme
// attribute 를 세팅. localStorage 값 → prefers-color-scheme → default 순.

export type ColorScheme = 'light' | 'dark' | 'system';

export interface ColorSchemeScriptOpts {
    /** localStorage key 이름. default `'vapor-ui-theme'`. */
    storageKey?: string;
    /** `<html>` 에 붙는 attribute 이름. default `'data-vapor-theme'`. */
    attribute?: string;
    /** localStorage 값 없을 때 fallback. default `'system'`. */
    defaultTheme?: ColorScheme;
}

const DEFAULTS = {
    storageKey: 'vapor-ui-theme',
    attribute: 'data-vapor-theme',
    defaultTheme: 'system' as ColorScheme,
};

/**
 * `<html>`에 theme attribute를 즉시 세팅하는 스크립트를 반환한다.
 *
 * @example
 * // Next.js layout.tsx (server component)
 * import { buildColorSchemeScript } from '@vapor-ui/style-macro';
 *
 * const SCRIPT = buildColorSchemeScript({ defaultTheme: 'system' });
 *
 * export default function RootLayout({ children }) {
 *     return (
 *         <html suppressHydrationWarning>
 *             <head>
 *                 <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
 *             </head>
 *             <body>{children}</body>
 *         </html>
 *     );
 * }
 */
export function buildColorSchemeScript(opts?: ColorSchemeScriptOpts) {
    const storageKey = opts?.storageKey ?? DEFAULTS.storageKey;
    const attribute = opts?.attribute ?? DEFAULTS.attribute;
    const defaultTheme = opts?.defaultTheme ?? DEFAULTS.defaultTheme;

    // 축약된 IIFE. try/catch — private/incognito 모드에서 localStorage 접근 실패 방어.
    // 인젝션 안전성: 모든 문자열 값은 JSON.stringify 로 감쌈.
    return (
        `(function(){try{` +
        `var k=${JSON.stringify(storageKey)},` +
        `a=${JSON.stringify(attribute)},` +
        `d=${JSON.stringify(defaultTheme)};` +
        `var s=localStorage.getItem(k);` +
        `var m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';` +
        `var t=s||(d==='system'?m:d);` +
        `document.documentElement.setAttribute(a,t);` +
        `}catch(e){}})();`
    );
}
