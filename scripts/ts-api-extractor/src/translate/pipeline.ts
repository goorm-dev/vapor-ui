import pLimit from 'p-limit';

import type { PropsInfoJson } from '~/models/output';
import { loadCache, makeCacheKey, partitionByCache, saveCache } from '~/translate/cache';
import type { CacheStore } from '~/translate/cache';
import { translateWithDeepl } from '~/translate/deepl';
import { processOneEntry } from '~/translate/mqm-ape-loop';
import {
    applyTranslations,
    buildComponentReports,
    collectTextEntries,
} from '~/translate/props-projection';
import type { ComponentReport } from '~/translate/report';
import type { TranslationConfig } from '~/translate/types';

const LLM_CONCURRENCY = 5;

export interface TranslateResult {
    props: PropsInfoJson[];
    componentReports: ComponentReport[];
}

function formatEntryLabel(
    props: PropsInfoJson[],
    entry: ReturnType<typeof collectTextEntries>[number],
): string {
    const component = props[entry.componentIndex];
    const componentName = component?.name ?? `component#${entry.componentIndex}`;

    if (entry.kind === 'component') {
        return `${componentName}.description`;
    }

    const propName =
        entry.propIndex !== undefined
            ? (component?.props[entry.propIndex]?.name ?? `prop#${entry.propIndex}`)
            : 'prop';

    return `${componentName}.props.${propName}`;
}

export async function translatePropsInfo(
    props: PropsInfoJson[],
    config: TranslationConfig,
    outputDir?: string,
    verbose = false,
): Promise<TranslateResult> {
    const log = (message: string): void => {
        if (verbose) console.error(`[i18n] ${message}`);
    };

    // 1. 텍스트 수집
    const entries = collectTextEntries(props);

    if (entries.length === 0) {
        log(`collected 0 translatable texts from ${props.length} components`);
        return {
            props: props.map((c) => ({ ...c, props: c.props.map((p) => ({ ...p })) })),
            componentReports: props.map((c) => ({
                name: c.name,
                totalTexts: 0,
                initial: { failCount: 0, errors: [] },
                final: { failCount: 0, errors: [] },
                degradedCount: 0,
            })),
        };
    }

    log(`collected ${entries.length} translatable texts from ${props.length} components`);

    const cacheOutputDir = outputDir ?? '';
    const useCache = !config.skipCache;
    const glossaryId = process.env['DEEPL_GLOSSARY_ID'] ?? '';

    // 2. 캐시 로드 & 히트/미스 분리
    let cacheStore: CacheStore = new Map();
    if (useCache && cacheOutputDir) {
        cacheStore = loadCache(cacheOutputDir);
    }

    const { finalEntries, missIndices, cacheHits } = useCache
        ? partitionByCache(entries, cacheStore, config, glossaryId)
        : {
              finalEntries: new Array(entries.length),
              missIndices: entries.map((_, i) => i),
              cacheHits: 0,
          };

    log(`cache: ${cacheHits} hit, ${missIndices.length} miss`);

    // 3. DeepL 배치 번역 + 4. 검증·후처리 루프
    if (missIndices.length > 0) {
        const limit = pLimit(LLM_CONCURRENCY);

        const missTexts = missIndices.map((i) => entries[i].text);
        log(`deepl: translating ${missTexts.length} texts`);
        const deeplResults = await translateWithDeepl(missTexts, glossaryId);
        log(
            deeplResults
                ? `deepl: received ${deeplResults.length} translations`
                : 'deepl: unavailable, falling back to source text',
        );

        if (!deeplResults) {
            for (const i of missIndices) {
                console.warn(`[deepl] Unavailable, using source text as fallback for all misses.`);
                finalEntries[i] = {
                    translated: entries[i].text,
                    initial: { verdict: 'FAIL', errors: [] },
                    final: { verdict: 'FAIL', errors: [] },
                };
            }
        } else {
            const missResults = await Promise.all(
                missIndices.map(async (entryIndex, batchIndex) => {
                    const entry = entries[entryIndex];
                    const mtOutput = deeplResults[batchIndex];
                    const label = formatEntryLabel(props, entry);

                    if (mtOutput === undefined) {
                        console.warn(
                            `[deepl] Missing result at batch index ${batchIndex}, using source text as fallback.`,
                        );
                    }

                    return processOneEntry(entry, mtOutput, config, limit, label, log);
                }),
            );

            // 5. 미스 결과 병합 & 캐시 갱신
            for (let batchIndex = 0; batchIndex < missIndices.length; batchIndex++) {
                const entryIndex = missIndices[batchIndex];
                const finalEntry = missResults[batchIndex];
                finalEntries[entryIndex] = finalEntry;

                if (useCache && finalEntry.translated !== entries[entryIndex].text) {
                    const key = makeCacheKey(entries[entryIndex].text, config, glossaryId);
                    cacheStore.set(key, {
                        source: entries[entryIndex].text,
                        translated: finalEntry.translated,
                    });
                }
            }
        }
    }

    if (useCache && cacheOutputDir) {
        saveCache(cacheOutputDir, cacheStore);
        log(`cache: saved ${cacheStore.size} entries`);
    } else {
        log(`cache: save skipped (${useCache ? 'no outputDir' : 'skipCache=true'})`);
    }

    // 6. props 재구성 & 7. 리포트 집계
    const translatedProps = applyTranslations(props, entries, finalEntries);
    const componentReports = buildComponentReports(props, entries, finalEntries);

    log(`completed ${translatedProps.length} components`);

    return { props: translatedProps, componentReports };
}
