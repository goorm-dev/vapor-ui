import { isAbsolute, relative, resolve, sep } from 'node:path';
import picomatch from 'picomatch';

import { DEFAULT_LAYER } from '~/compilers/emit-css';
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
    /**
     * `css()` 가 생성한 규칙을 담을 CSS cascade layer 이름. 기본값 `vapor-utilities`.
     * 라이브러리 빌드가 앱과 다른 레이어에 규칙을 두어 우선순위를 레이어 순서로 고정할 때 쓴다
     * (예: `@vapor-ui/composites` 는 `composites`). 지정한 레이어는 CSS 진입점의 레이어 순서
     * 선언에 포함돼야 한다 — 없으면 브라우저가 맨 뒤 레이어로 취급한다.
     */
    layer?: string;
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
    layer: string;
}

// CSS ident 점(.) 구분 — sub-layer(`acme.ui`) 허용, 공백·구두점·숫자 시작은 거부.
const LAYER_NAME_RE = /^-?[A-Za-z_][\w-]*(?:\.-?[A-Za-z_][\w-]*)*$/;

function validateLayer(layer: string): string {
    if (!LAYER_NAME_RE.test(layer)) {
        throw new Error(
            `[@vapor-ui/style-macro] Invalid \`layer\` option ${JSON.stringify(layer)}: ` +
                'expected a CSS layer name such as "vapor-utilities" or "acme.ui".',
        );
    }
    return layer;
}

const SOURCE_EXT_RE = /\.(?:tsx?|jsx?|mts|mjs|cts|cjs)$/;

export function defaultInclude(id: string): boolean {
    if (id.includes('node_modules')) return false;
    return SOURCE_EXT_RE.test(id);
}

/**
 * class 이름 해시용 파일 식별자. root 기준 POSIX 상대 경로라 빌드 머신과 무관하게 같다.
 * JS 변환과 CSS 수집이 같은 값을 써야 class 이름이 일치한다.
 */
export function scopeOf(root: string, file: string): string {
    return toPosix(relative(root, file.split('?')[0]));
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
        layer = DEFAULT_LAYER,
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
        layer: validateLayer(layer),
    };
}
