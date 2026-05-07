import pLimit from 'p-limit';

import type { PropsInfoJson } from '~/models/output';
import { loadCache, makeCacheKey, saveCache } from '~/translate/cache';
import type { CacheStore } from '~/translate/cache';
import { translateWithDeepl } from '~/translate/deepl';
import {
    applyTranslations,
    buildComponentReports,
    collectTextEntries,
    partitionByCache,
} from '~/translate/entry-transforms';
import { processOneEntry } from '~/translate/mqm-ape-loop';
import type { ComponentReport } from '~/translate/report';
import type { MqmError, TranslationConfig } from '~/translate/types';

const LLM_CONCURRENCY = 5;

export interface TranslateResult {
    props: PropsInfoJson[];
    componentReports: ComponentReport[];
}

/** spec 기능 3: mt_span을 제거한 나머지 구간을 no_edit_spans로 추출 */
export function extractNoEditSpans(mtOutput: string, errors: MqmError[]): string[] {
    let remaining = mtOutput;
    for (const error of errors) {
        remaining = remaining.replace(error.mt_span, '\x00');
    }
    return remaining
        .split('\x00')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

export interface PatchResult {
    result: string;
    hasOverEdit: boolean;
}

/** spec 기능 5: noEditSpans 밖의 변경을 감지하고, over-editing 시 손상된 no-edit span을 MT 원본으로 복원 */
export function applySelectivePatch(
    mtOutput: string,
    rewrittenOutput: string,
    noEditSpans: string[],
): PatchResult {
    if (mtOutput === rewrittenOutput) {
        return { result: rewrittenOutput, hasOverEdit: false };
    }

    const damagedSpans = noEditSpans.filter(
        (span) => span.length > 0 && !rewrittenOutput.includes(span),
    );

    if (damagedSpans.length === 0) {
        return { result: rewrittenOutput, hasOverEdit: false };
    }

    // over-editing 발생: 손상된 no-edit span을 rewritten에서 찾아 MT 원본으로 교체
    // char offset은 MT와 rewritten에서 달라지므로 단어 인덱스(토큰 번호) 기반으로 위치를 추적
    const mtTokens = mtOutput.split(' ');

    let result = rewrittenOutput;
    for (const span of damagedSpans) {
        const spanTokens = span.split(' ');
        const spanTokenCount = spanTokens.length;

        let mtTokenStart = -1;
        for (let i = 0; i <= mtTokens.length - spanTokenCount; i++) {
            if (mtTokens.slice(i, i + spanTokenCount).join(' ') === span) {
                mtTokenStart = i;
                break;
            }
        }

        if (mtTokenStart === -1) {
            return { result: mtOutput, hasOverEdit: true };
        }

        const resultTokens = result.split(' ');
        if (mtTokenStart + spanTokenCount > resultTokens.length) {
            return { result: mtOutput, hasOverEdit: true };
        }

        resultTokens.splice(mtTokenStart, spanTokenCount, span);
        result = resultTokens.join(' ');
    }

    return { result, hasOverEdit: true };
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
                failCount: 0,
                errors: [],
                degradedCount: 0,
            })),
        };
    }

    log(`collected ${entries.length} translatable texts from ${props.length} components`);

    const cacheOutputDir = outputDir ?? '';
    const useCache = !config.skipCache;
    const glossaryId = process.env['DEEPL_GLOSSARY_ID'] ?? '';
    const postprocessModel = config.llm.postprocessModel ?? 'claude-sonnet-4-6';
    const validationModel = config.llm.validationModel ?? 'claude-sonnet-4-6';

    // 2. 캐시 로드 & 히트/미스 분리
    let cacheStore: CacheStore = new Map();
    if (useCache && cacheOutputDir) {
        cacheStore = loadCache(cacheOutputDir);
    }

    const { finalEntries, missIndices, cacheHits } = useCache
        ? partitionByCache(
              entries,
              cacheStore,
              config,
              postprocessModel,
              validationModel,
              glossaryId,
          )
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
                    initial: { verdict: 'PASS', errors: [] },
                    final: { verdict: 'PASS', errors: [] },
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
                    const key = makeCacheKey(
                        entries[entryIndex].text,
                        config.targetLocale,
                        config.llm.enabled,
                        config.validation.mqm.enabled,
                        postprocessModel,
                        validationModel,
                        glossaryId,
                    );
                    cacheStore.set(key, {
                        source: entries[entryIndex].text,
                        translated: finalEntry.translated,
                        cachedAt: new Date().toISOString(),
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
