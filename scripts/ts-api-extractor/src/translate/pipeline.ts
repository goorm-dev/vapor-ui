import pLimit from 'p-limit';

import type { PropsInfoJson } from '~/models/output';
import { loadCache, makeCacheKey, saveCache } from '~/translate/cache';
import type { CacheStore } from '~/translate/cache';
import { translateWithDeepl } from '~/translate/deepl';
import { postprocessWithLlm } from '~/translate/llm-postprocess';
import { validateWithMqm } from '~/translate/mqm-validator';
import type { ComponentReport } from '~/translate/report';
import type { MqmError, TranslationConfig } from '~/translate/types';

const LLM_CONCURRENCY = 5;

interface TextEntry {
    text: string;
    kind: 'component' | 'prop';
    componentIndex: number;
    propIndex?: number;
}

export interface TranslateResult {
    props: PropsInfoJson[];
    componentReports: ComponentReport[];
}

export async function translatePropsInfo(
    props: PropsInfoJson[],
    config: TranslationConfig,
    outputDir?: string,
    skipCache = false,
): Promise<TranslateResult> {
    // 1. Collect all texts that have descriptions
    const entries: TextEntry[] = [];

    for (let componentIndex = 0; componentIndex < props.length; componentIndex++) {
        const component = props[componentIndex];

        if (component.description) {
            entries.push({
                text: component.description,
                kind: 'component',
                componentIndex,
            });
        }

        for (let propIndex = 0; propIndex < component.props.length; propIndex++) {
            const prop = component.props[propIndex];
            if (prop.description) {
                entries.push({
                    text: prop.description,
                    kind: 'prop',
                    componentIndex,
                    propIndex,
                });
            }
        }
    }

    if (entries.length === 0) {
        return {
            props: props.map((component) => ({ ...component, props: component.props.map((prop) => ({ ...prop })) })),
            componentReports: props.map((component) => ({ name: component.name, totalTexts: 0, failCount: 0, errors: [] })),
        };
    }

    const cacheOutputDir = outputDir ?? '';
    const useCache = !skipCache;
    const llmModel = process.env['LITELLM_MODEL'] ?? 'claude-sonnet-4-6';
    const glossaryId = process.env['DEEPL_GLOSSARY_ID'] ?? '';

    let cacheStore: CacheStore = new Map();
    if (useCache && cacheOutputDir) {
        cacheStore = loadCache(cacheOutputDir);
    }

    // 2. Separate cache hits from misses
    const finalTranslations: string[] = new Array(entries.length);
    const missIndices: number[] = [];

    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        const entry = entries[entryIndex];
        if (useCache) {
            const key = makeCacheKey(entry.text, config.targetLocale, llmModel, glossaryId);
            const hit = cacheStore.get(key);
            if (hit) {
                finalTranslations[entryIndex] = hit.translated;
                continue;
            }
        }
        missIndices.push(entryIndex);
    }

    const mqmErrorsByEntryIdx = new Map<number, MqmError[]>();

    if (missIndices.length > 0) {
        const limit = pLimit(LLM_CONCURRENCY);

        // 3. Batch translate misses with DeepL
        const missTexts = missIndices.map((i) => entries[i].text);
        const deeplResults = await translateWithDeepl(missTexts, glossaryId);

        // 4. LLM post-process miss entries (concurrency-limited)
        // If DeepL returned no result for a slot, skip LLM and use the source text as-is
        // (sending English to an LLM asked to "edit Korean" produces garbage)
        const postprocessed = await Promise.all(
            missIndices.map((entryIndex, batchIndex) => {
                const deeplResult = deeplResults[batchIndex];
                if (deeplResult === undefined) {
                    console.warn(
                        `[deepl] Missing result at batch index ${batchIndex}, using source text as fallback.`,
                    );
                    return Promise.resolve(entries[entryIndex].text);
                }
                return limit(() =>
                    postprocessWithLlm(entries[entryIndex].text, deeplResult),
                );
            }),
        );

        // 5. MQM validate miss entries (concurrency-limited)

        const missTranslations: string[] = await Promise.all(
            missIndices.map(async (entryIndex, batchIndex) => {
                let translated = postprocessed[batchIndex];
                const entry = entries[entryIndex];

                if (config.validation.mqm.enabled) {
                    const mqmResult = await limit(() =>
                        validateWithMqm(entry.text, translated, config),
                    );

                    if (mqmResult.verdict === 'FAIL') {
                        console.warn(
                            `[mqm-validator] Translation validation FAILED for: "${entry.text.slice(0, 60)}...". Re-running LLM postprocess with error feedback.`,
                        );
                        const deeplDraft = deeplResults[batchIndex];
                        translated = await limit(() =>
                            postprocessWithLlm(
                                entry.text,
                                deeplDraft ?? entry.text,
                                mqmResult.errors,
                            ),
                        );

                        if (config.validation.mqm.failOnError) {
                            const recheck = await limit(() =>
                                validateWithMqm(entry.text, translated, config),
                            );
                            if (recheck.verdict === 'FAIL') {
                                throw new Error(
                                    `[mqm-validator] Translation validation FAILED after retry for: "${entry.text.slice(0, 60)}..."`,
                                );
                            }
                        } else {
                            // Retry succeeded or failOnError:false — clear the initial errors
                            // so the report only shows errors for the actual final translation
                            mqmErrorsByEntryIdx.delete(entryIndex);
                        }
                    }
                }

                return translated;
            }),
        );

        // 6. Merge miss results back and update cache store
        for (let batchIndex = 0; batchIndex < missIndices.length; batchIndex++) {
            const entryIndex = missIndices[batchIndex];
            const translated = missTranslations[batchIndex];
            finalTranslations[entryIndex] = translated;

            // Only cache when translation differs from source — fallback entries
            // (English source used as-is due to DeepL failure) must not be cached
            // because a future run would reuse the wrong language as a "translation"
            if (useCache && translated !== entries[entryIndex].text) {
                const key = makeCacheKey(
                    entries[entryIndex].text,
                    config.targetLocale,
                    llmModel,
                    glossaryId,
                );
                cacheStore.set(key, {
                    source: entries[entryIndex].text,
                    translated,
                    cachedAt: new Date().toISOString(),
                });
            }
        }
    }

    if (useCache && cacheOutputDir) {
        saveCache(cacheOutputDir, cacheStore);
    }

    // 7. Build new PropsInfoJson array with translated descriptions (no mutation)
    const result: PropsInfoJson[] = props.map((component) => ({
        ...component,
        props: component.props.map((prop) => ({ ...prop })),
    }));

    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        const entry = entries[entryIndex];
        const translated = finalTranslations[entryIndex];

        if (entry.kind === 'component') {
            result[entry.componentIndex] = {
                ...result[entry.componentIndex],
                description: translated,
            };
        } else if (entry.kind === 'prop' && entry.propIndex !== undefined) {
            const component = result[entry.componentIndex];
            const updatedProps = [...component.props];
            updatedProps[entry.propIndex] = {
                ...updatedProps[entry.propIndex],
                description: translated,
            };
            result[entry.componentIndex] = { ...component, props: updatedProps };
        }
    }

    // 8. Build per-component reports
    const textCountByComponent = new Map<number, number>();
    for (const entry of entries) {
        const componentIndex = entry.componentIndex;
        textCountByComponent.set(componentIndex, (textCountByComponent.get(componentIndex) ?? 0) + 1);
    }

    const errorsByComponent = new Map<number, MqmError[]>();
    for (const [entryIndex, errors] of mqmErrorsByEntryIdx) {
        const componentIndex = entries[entryIndex].componentIndex;
        const existing = errorsByComponent.get(componentIndex) ?? [];
        errorsByComponent.set(componentIndex, [...existing, ...errors]);
    }

    const componentReports: ComponentReport[] = props.map((component, componentIndex) => {
        const errors = errorsByComponent.get(componentIndex) ?? [];
        return {
            name: component.name,
            totalTexts: textCountByComponent.get(componentIndex) ?? 0,
            failCount: errors.length,
            errors,
        };
    });

    return { props: result, componentReports };
}
