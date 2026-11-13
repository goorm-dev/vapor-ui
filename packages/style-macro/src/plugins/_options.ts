import { isAbsolute, resolve, sep } from 'node:path';
import picomatch from 'picomatch';

import type { ColorSchemeScriptOpts } from '~/helpers/fouc-script';

export interface VaporPluginOptions {
    /**
     * 추가 스캔/변환 대상 glob. 상대 경로는 `root` 기준이며 `../` 와 절대 경로도 된다.
     * 기본 대상(`root` 하위 JS/TS, `node_modules` 제외)에 **더해진다**.
     * `node_modules` 안의 prebuilt 라이브러리를 포함하려면 여기 명시한다.
     * 예: `['node_modules/@acme/ui/dist/**', '../shared/src/**']`
     */
    include?: string[];
    /** 제외 glob (`root` 기준, `../`·절대 경로 가능). `include` 보다 우선한다. */
    exclude?: string[];
    /**
     * 스캔 루트 · glob 기준 경로. 기본값은 번들러가 아는 프로젝트 루트
     * (Vite `root`, webpack `compiler.context`, Next 프로젝트 디렉터리), 없으면 `process.cwd()`.
     */
    root?: string;
    hash?: boolean;
    injectColorScheme?: boolean | ColorSchemeScriptOpts;
}

export interface ResolveDefaults {
    /** 번들러 컨텍스트가 제공하는 프로젝트 루트. 사용자 `root` 가 없을 때 쓴다. */
    root?: string;
}

export interface ResolvedOptions {
    /** 절대 경로를 받아 변환/수집 대상인지 판정. loader 와 수집기가 같은 함수를 쓴다. */
    include: (id: string) => boolean;
    /** 절대 경로로 정규화된 include glob. */
    includeGlobs: string[];
    root: string;
    hash: boolean;
    injectColorScheme: false | ColorSchemeScriptOpts;
}

const SOURCE_EXT_RE = /\.(?:tsx?|jsx?|mts|mjs|cts|cjs)$/;

export function defaultInclude(id: string): boolean {
    if (id.includes('node_modules')) return false;
    return SOURCE_EXT_RE.test(id);
}

export function toPosix(p: string): string {
    return sep === '/' ? p : p.split(sep).join('/');
}

/** glob 을 `root` 기준 절대 posix 경로로. `**` 등 glob 문법은 `resolve` 가 건드리지 않는다. */
function absoluteGlob(root: string, glob: string): string {
    return toPosix(isAbsolute(glob) ? glob : resolve(root, glob));
}

export function resolveOptions(
    opts: VaporPluginOptions = {},
    defaults: ResolveDefaults = {},
): ResolvedOptions {
    const {
        include = [],
        exclude = [],
        root: rawRoot,
        hash = process.env.NODE_ENV === 'production',
        injectColorScheme = true,
    } = opts;

    const root = resolve(rawRoot ?? defaults.root ?? process.cwd());
    const includeGlobs = include.map((g) => absoluteGlob(root, g));
    const excludeGlobs = exclude.map((g) => absoluteGlob(root, g));
    const isIncluded = includeGlobs.length ? picomatch(includeGlobs, { dot: true }) : null;
    const isExcluded = excludeGlobs.length ? picomatch(excludeGlobs, { dot: true }) : null;

    const includeFn = (id: string): boolean => {
        const abs = toPosix(isAbsolute(id) ? id : resolve(root, id));
        if (isExcluded && isExcluded(abs)) return false;
        if (isIncluded && isIncluded(abs)) return SOURCE_EXT_RE.test(abs);
        return defaultInclude(abs);
    };

    return {
        include: includeFn,
        includeGlobs,
        root,
        hash,
        injectColorScheme:
            injectColorScheme === false
                ? false
                : injectColorScheme === true
                  ? {}
                  : injectColorScheme,
    };
}
