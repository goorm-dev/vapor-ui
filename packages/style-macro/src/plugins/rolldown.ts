import { dirname, posix, relative, resolve } from 'node:path';

import { compileModule, isModuleCss } from './_module-css';
import { type VaporPluginOptions, resolveOptions, toPosix } from './_options';

export type { VaporPluginOptions };

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
    importedIds: readonly string[];
    dynamicallyImportedIds?: readonly string[];
    meta?: { css?: string };
}

type InputOption = string | string[] | Record<string, string> | undefined;

interface BuildEndContext {
    resolve(source: string): Promise<{ id: string } | null>;
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
 *    를 마지막 import 뒤에 넣는다 (`<file>` 은 확장자 포함: `button.tsx.vapor.css`).
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
    /**
     * `buildStart` 가 받은 `input` 의 entry 지정자들 (rolldown 이 정규화한 순서 — 이름순).
     * 서로 import 하지 않는 entry 끼리의 CSS 순서는 의미가 없고(같은 element 에 겹칠 class 가
     * 없다), 빌드마다 같기만 하면 된다. `getModuleIds` 의 발견 순서는 병렬 로딩이라 보장이 없다.
     */
    let inputs: string[] = [];

    return {
        name: 'vapor-style-macro:rolldown',

        buildStart(options?: { input?: InputOption }) {
            cssByPath.clear();
            extractedIds = new Set();
            const input = options?.input;
            inputs = !input ? [] : typeof input === 'string' ? [input] : Object.values(input);
        },

        transform(this: TransformContext, code: string, id: string) {
            let compiled;
            try {
                compiled = compileModule(code, id, resolved);
            } catch (e) {
                this.error((e as Error).message);
            }
            if (!compiled) return null;
            if (compiled.css) cssByPath.set(compiled.cssPath, compiled.css);
            return compiled.code === code ? null : { code: compiled.code, map: null };
        },

        resolveId(source: string, importer: string | undefined) {
            if (!importer || !isModuleCss(source)) return null;
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
            /** 모듈 그래프가 확정된 뒤 평가 순서대로 모듈 CSS 를 이어 붙인다. */
            async buildEnd(this: BuildEndContext) {
                const entries: string[] = [];
                for (const input of inputs) {
                    const id = (await this.resolve(input))?.id;
                    if (id && !entries.includes(id)) entries.push(id);
                }
                // input 으로 못 찾은 entry(다른 플러그인이 emit 한 chunk 등)는 발견 순서로 뒤에.
                for (const id of this.getModuleIds()) {
                    if (this.getModuleInfo(id)?.isEntry && !entries.includes(id)) entries.push(id);
                }
                const ordered = evaluationOrder(this, entries).filter(
                    (id) => this.getModuleInfo(id)?.meta?.css !== undefined,
                );
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
 * 모듈들이 ES 모듈 평가 순서로 실행되는 순서 — 브라우저가 모듈 CSS 를 적용하는 순서이기도 하다.
 * entry 부터 깊이 우선으로, 각 모듈의 static import 를 적힌 순서대로 먼저 평가하고 그 모듈을
 * 평가한다(post-order). 이미 방문한 모듈(공유 모듈, 순환)은 처음 평가된 자리에 한 번만 둔다.
 * 모듈 CSS 는 자기 모듈의 마지막 import 로 들어가므로, 의존 모듈의 CSS 가 먼저 오고 그 모듈의
 * CSS 가 뒤에 온다. dynamic import 는 static 그래프 전체가 평가된 뒤 로드되므로 그 뒤에 둔다.
 *
 * Rollup 의 chunk 실행 순서(`execIndex`)와 Vite 의 CSS code split 순서가 같은 규칙이다.
 * 그래프를 위로(importers) 거슬러 오르지 않는다 — rolldown 은 external 모듈의 importers 를
 * 채우지 않는다.
 */
function evaluationOrder(ctx: BuildEndContext, entries: string[]): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    const dynamic: string[] = [];
    const visit = (id: string) => {
        if (visited.has(id)) return;
        visited.add(id);
        const info = ctx.getModuleInfo(id);
        for (const dep of info?.importedIds ?? []) visit(dep);
        dynamic.push(...(info?.dynamicallyImportedIds ?? []));
        order.push(id);
    };
    for (const e of entries) visit(e);
    while (dynamic.length) visit(dynamic.shift()!);
    return order;
}
