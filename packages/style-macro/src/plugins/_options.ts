import { readFileSync } from 'node:fs';
import { dirname, join, posix, relative, resolve, sep } from 'node:path';
import picomatch from 'picomatch';

import { DEFAULT_LAYER } from '~/compilers/emit-css';
import type { ColorSchemeScriptOpts } from '~/helpers/fouc-script';

import { stripQuery } from './_id';

export interface VaporPluginOptions {
    /**
     * 추가 변환 대상 glob. 상대 경로는 `root` 기준이며 `../` 와 절대 경로도 된다.
     * 기본 대상(`root` 하위 JS/TS, `node_modules` 제외)에 **더해진다**.
     * `node_modules` 안의 prebuilt 라이브러리를 포함하려면 여기 명시한다.
     * 예: `['node_modules/@acme/ui/dist/**', '../shared/src/**']`
     */
    include?: string[];
    /** 제외 glob (`root` 기준, `../`·절대 경로 가능). `include` 보다 우선한다. */
    exclude?: string[];
    /**
     * `include`/`exclude` glob 기준 경로. 기본값은 번들러가 아는 프로젝트 루트
     * (Vite `root`, webpack `compiler.context`, Next 프로젝트 디렉터리), 없으면 `process.cwd()`.
     */
    root?: string;
    hash?: boolean;
    injectColorScheme?: boolean | ColorSchemeScriptOpts;
    /**
     * `css()` 가 생성한 규칙을 담을 CSS cascade layer 이름. 기본값 `vapor-utilities`.
     * 라이브러리 빌드가 앱과 다른 레이어에 규칙을 두어 우선순위를 레이어 순서로 고정할 때 쓴다
     * (예: `@vapor-ui/composites` 는 `vapor-composites`). 지정한 레이어는 CSS 진입점의 레이어 순서
     * 선언에 포함돼야 한다 — 없으면 브라우저가 맨 뒤 레이어로 취급한다.
     */
    layer?: string;
}

export interface ResolveDefaults {
    /** 번들러 컨텍스트가 제공하는 프로젝트 루트. 사용자 `root` 가 없을 때 쓴다. */
    root?: string;
}

export interface ResolvedOptions {
    /** 절대 경로를 받아 변환 대상인지 판정. JS 변환과 CSS loader 가 같은 함수를 쓴다. */
    include: (id: string) => boolean;
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

const packageCache = new Map<string, { dir: string; name: string } | null>();

/** `dir` 에서 위로 올라가며 `name` 이 있는 첫 `package.json` 을 찾는다. */
function owningPackage(dir: string): { dir: string; name: string } | null {
    const cached = packageCache.get(dir);
    if (cached !== undefined) return cached;
    let found: { dir: string; name: string } | null = null;
    try {
        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as {
            name?: unknown;
        };
        if (typeof pkg.name === 'string' && pkg.name) found = { dir, name: pkg.name };
    } catch {
        // package.json 없음 → 상위로
    }
    if (!found) {
        const parent = dirname(dir);
        found = parent === dir ? null : owningPackage(parent);
    }
    packageCache.set(dir, found);
    return found;
}

/**
 * class 이름 해시용 파일 식별자: `<패키지 이름>/<패키지 기준 상대 경로>`. 빌드 머신·번들러
 * root 와 무관하게 같고, 다른 패키지의 같은 경로와도 겹치지 않는다. 이름 있는
 * `package.json` 이 없으면 root 기준 상대 경로. JS 변환과 CSS 생성이 같은 값을 써야
 * class 이름이 일치한다.
 */
export function scopeOf(root: string, file: string): string {
    const path = stripQuery(file);
    const pkg = owningPackage(dirname(path));
    if (!pkg) return toPosix(relative(root, path));
    return `${pkg.name}/${toPosix(relative(pkg.dir, path))}`;
}

export function toPosix(p: string): string {
    return sep === '/' ? p : p.split(sep).join('/');
}

/**
 * include/exclude 판정. 모든 경로 연산을 posix 공간에서 한다 — 번들러마다 id 의 구분자가 다르다
 * (Vite·Rollup 은 Windows 에서도 `C:/x/a.tsx`, webpack 은 `C:\\x\\a.tsx`). 그래서 id·root 를
 * 먼저 `/` 로 맞추고, 이후에는 `path.posix` 만 쓴다. 플랫폼 `path` 와 섞지 않는다.
 *
 * - glob 은 `root` 를 섞지 않는다: 상대 glob 은 root 기준 상대 경로와, 절대 glob 은 절대 경로와
 *   맞춘다. root 에 glob 문자(`(`, `[` …)가 있어도 그대로 경로다.
 * - `node_modules` 안의 파일은 패키지 경로(마지막 `node_modules/` 뒤 — Node 모듈 해석이 패키지를
 *   식별하는 방식)를 `root/node_modules/` 아래에 둔 경로로도 본다. 그래서
 *   `node_modules/@acme/ui/**` 가 npm·yarn 의 hoist 경로, pnpm 의 store 실경로
 *   (`.pnpm/@acme+ui@1.0.0/node_modules/@acme/ui/…`) 어디에서나 같은 패키지를 가리킨다.
 */
export function createIncludeFilter(
    rootPath: string,
    include: string[],
    exclude: string[],
): (id: string) => boolean {
    const root = toSlash(rootPath);
    const matcher = (glob: string) => {
        const g = toSlash(glob);
        const absolute = posix.isAbsolute(g) || DRIVE_RE.test(g);
        const m = picomatch(absolute ? g : posix.normalize(g), {
            dot: true,
            nocase: DRIVE_RE.test(root),
        });
        return absolute ? m : (abs: string) => m(posix.relative(root, abs));
    };
    const includeMatchers = include.map(matcher);
    const excludeMatchers = exclude.map(matcher);
    const matches = (ms: ((abs: string) => boolean)[], paths: string[]) =>
        ms.some((m) => paths.some((p) => m(p)));

    return (id) => {
        // `\0` 접두 id 는 다른 플러그인의 가상 모듈이다 (Rollup 관례). 파일이 아니다.
        if (id.startsWith('\0')) return false;
        const path = toSlash(id);
        const abs = posix.isAbsolute(path) || DRIVE_RE.test(path) ? path : posix.join(root, path);
        const i = abs.lastIndexOf('/node_modules/');
        const paths = i === -1 ? [abs] : [abs, posix.join(root, abs.slice(i + 1))];
        if (matches(excludeMatchers, paths)) return false;
        if (matches(includeMatchers, paths)) return SOURCE_EXT_RE.test(abs);
        return defaultInclude(abs);
    };
}

/** Windows 드라이브 문자로 시작하는 절대 경로 (`C:/…`). posix.isAbsolute 는 이를 모른다. */
const DRIVE_RE = /^[A-Za-z]:\//;

/**
 * 구분자를 `/` 로 맞춘다 (플랫폼과 무관하게 `\` 도 구분자로 본다). Windows 드라이브 문자는
 * 대소문자를 구분하지 않으므로 대문자로 맞춘다 (`c:/x` 와 `C:/x` 는 같은 경로).
 */
function toSlash(p: string): string {
    const s = p.replace(/\\/g, '/');
    return DRIVE_RE.test(s) ? s[0]!.toUpperCase() + s.slice(1) : s;
}

const PACKAGE_IN_GLOB_RE = /^(?:\.\/)?node_modules\/((?:@[^/]+\/)?[^/]+)(?:\/|$)/;

/**
 * `include` 가 `node_modules/<이름>/…` 로 지목한 패키지 이름들. 이름 부분에 glob 문자가 있으면
 * 이름을 정할 수 없으므로 뺀다. Vite 가 이 패키지들을 dependency pre-bundling(esbuild)에서 빼야
 * dev 에서도 매크로 변환을 거친다.
 */
export function includedPackages(include: string[]): string[] {
    const names = new Set<string>();
    for (const glob of include) {
        const name = PACKAGE_IN_GLOB_RE.exec(toPosix(glob))?.[1];
        if (name && !picomatch.scan(name).isGlob) names.add(name);
    }
    return [...names];
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
    const includeFn = createIncludeFilter(root, include, exclude);

    return {
        include: includeFn,
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
