import { buildSheet } from './_collect';
import unplugin from './_factory';
import { type VaporPluginOptions, resolveOptions } from './_options';

export type { VaporPluginOptions };

export interface VaporRolldownOptions extends VaporPluginOptions {
    /**
     * 라이브러리 빌드용. 지정하면 번들에 포함된 모듈의 `css()` 룰을 모아 이 이름의
     * CSS asset 하나로 방출한다 (`@layer vapor-utilities` 단일 정렬 시트).
     * 소비자는 플러그인 없이 이 파일만 import 하면 된다. JS 의 class 이름과 일치하도록
     * 같은 `hash` 설정을 쓰므로, 배포물은 `hash: true` 로 고정해 빌드한다.
     */
    cssFileName?: string;
}

/** rolldown 을 의존성에 두지 않으므로 unplugin 이 노출하는 플러그인 타입을 그대로 쓴다. */
type RolldownPlugin = ReturnType<typeof unplugin.rolldown>;

interface BundleEntry {
    type: 'chunk' | 'asset';
    moduleIds?: string[];
}

interface GenerateBundleContext {
    emitFile(file: { type: 'asset'; fileName: string; source: string }): unknown;
}

/**
 * Rolldown plugin for @vapor-ui/style-macro — 기본은 JS 변환만 담당한다.
 * 애플리케이션 빌드의 CSS 는 PostCSS 에 `@vapor-ui/style-macro/postcss` 를 등록해
 * `@vapor-utilities;` 또는 `@import '@vapor-ui/core/layers.css'` 자리에서 수집한다.
 *
 *     // rolldown.config.js
 *     import { vaporRolldownPlugin } from '@vapor-ui/style-macro/rolldown';
 *     export default { plugins: [vaporRolldownPlugin()] };
 *
 * 라이브러리 빌드는 `cssFileName` 으로 시트를 함께 배포한다.
 *
 *     vaporRolldownPlugin({ hash: true, cssFileName: 'styles.css' });
 */
export function vaporRolldownPlugin(opts: VaporRolldownOptions = {}): RolldownPlugin {
    const { cssFileName, ...pluginOpts } = opts;
    const plugin = unplugin.rolldown(pluginOpts);
    if (!cssFileName) return plugin;

    return Object.assign(plugin, {
        generateBundle(
            this: GenerateBundleContext,
            _options: unknown,
            bundle: Record<string, BundleEntry>,
        ) {
            const resolved = resolveOptions(pluginOpts);
            const moduleIds = Object.values(bundle)
                .flatMap((entry) => (entry.type === 'chunk' ? (entry.moduleIds ?? []) : []))
                .filter((id) => !id.startsWith('\0'))
                .map((id) => id.split('?')[0]!);

            this.emitFile({
                type: 'asset',
                fileName: cssFileName,
                source: buildSheet(moduleIds, resolved).css,
            });
        },
    });
}
