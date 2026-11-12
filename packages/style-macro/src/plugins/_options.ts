import { isAbsolute, relative, resolve, sep } from 'node:path';
import picomatch from 'picomatch';

import type { ColorSchemeScriptOpts } from '~/helpers/fouc-script';

export interface VaporPluginOptions {
    /**
     * 추가 스캔/변환 대상 glob (`root` 기준). 기본 대상(`root` 하위 JS/TS, `node_modules` 제외)
     * 에 **더해진다**. `node_modules` 안의 prebuilt 라이브러리를 포함하려면 여기 명시한다.
     * 예: `['node_modules/@acme/ui/dist/**']`
     */
    include?: string[];
    /** 제외 glob (`root` 기준). `include` 보다 우선한다. */
    exclude?: string[];
    /** 스캔 루트 · glob 기준 경로. 기본 `process.cwd()`. */
    root?: string;
    hash?: boolean;
    injectColorScheme?: boolean | ColorSchemeScriptOpts;
}

export interface ResolvedOptions {
    /** 절대 경로를 받아 변환/수집 대상인지 판정. loader 와 수집기가 같은 함수를 쓴다. */
    include: (id: string) => boolean;
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

function toPosix(p: string): string {
    return sep === '/' ? p : p.split(sep).join('/');
}

export function resolveOptions(opts: VaporPluginOptions = {}): ResolvedOptions {
    const {
        include: includeGlobs = [],
        exclude: excludeGlobs = [],
        root: rawRoot,
        hash = process.env.NODE_ENV === 'production',
        injectColorScheme = true,
    } = opts;

    const root = resolve(rawRoot ?? process.cwd());
    const isIncluded = includeGlobs.length ? picomatch(includeGlobs, { dot: true }) : null;
    const isExcluded = excludeGlobs.length ? picomatch(excludeGlobs, { dot: true }) : null;

    const include = (id: string): boolean => {
        const abs = isAbsolute(id) ? id : resolve(root, id);
        const rel = toPosix(relative(root, abs));
        const outsideRoot = rel.startsWith('..');
        if (isExcluded && !outsideRoot && isExcluded(rel)) return false;
        if (isIncluded && !outsideRoot && isIncluded(rel)) return SOURCE_EXT_RE.test(abs);
        return defaultInclude(abs);
    };

    return {
        include,
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
