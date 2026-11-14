import { basename, dirname, extname, posix, relative, resolve } from 'node:path';

import { formatBuildError } from '~/compilers/code-frame';
import { transform } from '~/compilers/transform';

import { type VaporPluginOptions, resolveOptions, scopeOf, toPosix } from './_options';

export type { VaporPluginOptions };

const CSS_SUFFIX = '.vapor.css';

/** 모듈 CSS 앞에 붙는 레이어 순서 선언. 순서는 `@vapor-ui/core/layers.css` 한 곳에서만 정한다. */
const LAYER_STATEMENT_RE = /^@layer [^;{]+;\n/;

interface TransformContext {
    error(message: string): never;
}

export interface VaporRolldownOptions extends VaporPluginOptions {
    /**
     * 모든 모듈 CSS 를 파일 하나로 합친다 (`@vanilla-extract/rollup-plugin` 의 `extract` 와 같음).
     * 켜면 모듈별 CSS 에셋을 만들지 않고 출력 JS 의 CSS import 도 지운다 — 소비자가 합친 파일을
     * 직접 import 해야 한다. `true` 면 `index.css`. 위치는 `output.assetFileNames` 가 정한다.
     * @default false
     */
    extract?: boolean | { name?: string };
}

interface ModuleInfoLike {
    id: string;
    isEntry: boolean;
    importers: readonly string[];
    importedIds: readonly string[];
    meta?: { css?: string };
}

interface BuildEndContext {
    getModuleIds(): Iterable<string>;
    getModuleInfo(id: string): ModuleInfoLike | null;
    emitFile(file: {
        type: 'asset';
        name: string;
        originalFileName: string;
        source: string;
    }): unknown;
    warn(message: string): void;
}

interface OutputChunkLike {
    type: 'chunk' | 'asset';
    code?: string;
    imports?: string[];
}

interface RenderChunkContext {
    getModuleInfo(id: string): { meta?: { css?: string } } | null;
    emitFile(file: {
        type: 'asset';
        name: string;
        originalFileName: string;
        source: string;
    }): string;
    getFileName(referenceId: string): string;
}

/**
 * Rolldown plugin for @vapor-ui/style-macro — 라이브러리 빌드용.
 * `@vanilla-extract/rollup-plugin` 과 같은 구조로, 출력 파일 구성은 rolldown 설정이 정한다.
 *
 * 1. `transform` — `css()` 를 class 로 바꾸고, CSS 를 만든 모듈에 `import './<file>.vapor.css'`
 *    를 마지막 import 뒤에 넣는다.
 * 2. `resolveId` — 그 import 를 external 모듈로 두고 CSS 를 `meta.css` 에 싣는다. id 는 `root`
 *    기준 상대 경로다 (절대 경로면 rolldown 이 출력 기준 경로로 바꿔 3 에서 찾지 못한다).
 * 3. `renderChunk` — 출력 chunk 가 import 하는 모듈 CSS 를 에셋으로 내보내고
 *    (`name` + `originalFileName`), rolldown 이 정한 에셋 경로로 import 를 바꾼다.
 *
 * 에셋 위치는 `output.assetFileNames` 가, chunk 분할은 `output.preserveModules` 등이 정한다.
 * `preserveModules` 면 컴포넌트 출력 파일마다 자기 CSS 를 import 하므로, 소비자는 import 한
 * 컴포넌트의 CSS 만 가져간다 (`package.json` `sideEffects: ["**\/*.css"]` 필요).
 *
 *     // rolldown.config.ts
 *     import { assetFileNames } from '@repo/rolldown-config';
 *     export default {
 *         plugins: [vaporRolldownPlugin({ hash: true, layer: 'acme-ui' })],
 *         output: { preserveModules: true, preserveModulesRoot: 'src', assetFileNames },
 *     };
 *
 * 배포물은 `hash: true` 로 고정한다. 기본값은 빌드 시점 `NODE_ENV` 를 따른다.
 */
export function vaporRolldownPlugin(opts: VaporRolldownOptions = {}) {
    const { extract = false, ...pluginOpts } = opts;
    const resolved = resolveOptions(pluginOpts);
    const extractName =
        extract === false ? null : ((extract === true ? undefined : extract.name) ?? 'index.css');
    /** extract 모드에서 합친 모듈 CSS 의 id. 출력 JS 에서 이 import 를 지운다. */
    let extractedIds = new Set<string>();
    /** 모듈 CSS 의 절대 경로 → CSS. `transform` 이 채우고 `resolveId` 가 meta 로 옮긴다. */
    const cssByPath = new Map<string, string>();

    return {
        name: 'vapor-style-macro:rolldown',

        buildStart() {
            cssByPath.clear();
            extractedIds = new Set();
        },

        transform(this: TransformContext, code: string, id: string) {
            const filename = id.split('?')[0]!;
            if (!resolved.include(filename) || !code.includes('@vapor-ui/style-macro')) return null;

            const cssFile = `${basename(filename, extname(filename))}${CSS_SUFFIX}`;
            const result = transform({
                source: code,
                filename,
                hash: resolved.hash,
                layer: resolved.layer,
                scope: scopeOf(resolved.root, filename),
                cssImport: `./${cssFile}`,
            });
            if (result.errors.length) {
                this.error(
                    result.errors.map((e) => formatBuildError(e, code, filename)).join('\n\n'),
                );
            }
            if (result.css) {
                cssByPath.set(
                    resolve(dirname(filename), cssFile),
                    result.css.replace(LAYER_STATEMENT_RE, ''),
                );
            }
            return result.code === code ? null : { code: result.code, map: null };
        },

        resolveId(source: string, importer: string | undefined) {
            if (!importer || !source.endsWith(CSS_SUFFIX)) return null;
            const path = resolve(dirname(importer.split('?')[0]!), source);
            const css = cssByPath.get(path);
            if (css === undefined) return null;
            return {
                id: toPosix(relative(resolved.root, path)),
                external: true,
                moduleSideEffects: true,
                meta: { css },
            };
        },

        renderChunk(
            this: RenderChunkContext,
            code: string,
            chunk: { fileName: string; imports: string[] },
        ) {
            if (extractName) return null;
            let output = code;
            for (const importPath of chunk.imports) {
                const css = this.getModuleInfo(importPath)?.meta?.css;
                if (css === undefined) continue;
                const ref = this.emitFile({
                    type: 'asset',
                    name: posix.basename(importPath),
                    originalFileName: importPath,
                    source: css,
                });
                const assetPath = posix.relative(
                    posix.dirname(chunk.fileName),
                    this.getFileName(ref),
                );
                output = output.replace(importPath, `./${posix.normalize(assetPath)}`);
            }
            return output === code ? null : { code: output, map: null };
        },

        ...(extractName && {
            /** 모듈 그래프가 확정된 뒤 import 순서대로 모듈 CSS 를 이어 붙인다. */
            buildEnd(this: BuildEndContext) {
                const ids = [...this.getModuleIds()].filter(
                    (id) => this.getModuleInfo(id)?.meta?.css !== undefined,
                );
                const ordered = sortByImportChain(this, ids);
                extractedIds = new Set(ordered);
                this.emitFile({
                    type: 'asset',
                    name: extractName,
                    originalFileName: extractName,
                    source: ordered.map((id) => this.getModuleInfo(id)!.meta!.css!).join('\n'),
                });
            },

            /** 합친 파일로 대체된 모듈 CSS 의 side-effect import / require 를 지운다. */
            generateBundle(_options: unknown, bundle: Record<string, OutputChunkLike>) {
                const extracted = extractedIds;
                const strip = (match: string, esm?: string, cjs?: string) =>
                    extracted.has((esm ?? cjs)!) ? '' : match;
                for (const chunk of Object.values(bundle)) {
                    if (chunk.type !== 'chunk' || chunk.code === undefined) continue;
                    if (!chunk.imports?.some((i) => extracted.has(i))) continue;
                    chunk.code = chunk.code.replace(SIDE_EFFECT_IMPORT_RE, strip);
                }
            },
        }),
    };
}

const SIDE_EFFECT_IMPORT_RE =
    /^\s*(?:import\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))\s*;?[ \t]*\n?/gm;

/**
 * CSS 모듈을 import 순서로 정렬한다 (`@vanilla-extract/rollup-plugin` 의 `buildImportChain` /
 * `sortModules` 이식). 각 CSS 에서 entry 까지 마지막 importer 를 따라 올라가며
 * `[모듈, importer 안에서의 import 순번]` 사슬을 만들고, 사슬을 entry 쪽부터 비교한다.
 */
function sortByImportChain(ctx: BuildEndContext, ids: string[]): string[] {
    const chainOf = (id: string): Array<[string, number]> => {
        let mod = ctx.getModuleInfo(id);
        const chain: Array<[string, number]> = [[id, -1]];
        while (mod && !mod.isEntry) {
            const importer = mod.importers.at(-1);
            if (!importer) break;
            if (chain.some(([c]) => c === importer)) {
                ctx.warn(
                    `[@vapor-ui/style-macro] Circular import; CSS order may be off near ${importer}`,
                );
                break;
            }
            const parent = ctx.getModuleInfo(importer);
            if (!parent) break;
            chain.push([importer, parent.importedIds.indexOf(mod.id)]);
            mod = parent;
        }
        return chain.reverse();
    };
    const chains = new Map(ids.map((id) => [id, chainOf(id)]));
    return [...ids].sort((a, b) => {
        const ca = chains.get(a)!;
        const cb = chains.get(b)!;
        for (let i = 0; i < Math.min(ca.length, cb.length); i++) {
            const [ma, oa] = ca[i]!;
            const [mb, ob] = cb[i]!;
            if (ma === mb && oa === ob) continue;
            if (oa !== ob) return oa - ob;
        }
        return 0;
    });
}
