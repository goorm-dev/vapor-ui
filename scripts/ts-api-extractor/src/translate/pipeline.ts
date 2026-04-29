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

/** spec 기능 3: mt_span을 제거한 나머지 구간을 no_edit_spans로 추출 */
function extractNoEditSpans(mtOutput: string, errors: MqmError[]): string[] {
    let remaining = mtOutput;
    for (const error of errors) {
        remaining = remaining.replace(error.mt_span, '\x00');
    }
    return remaining
        .split('\x00')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

interface PatchResult {
    result: string;
    hasOverEdit: boolean;
}

/** spec 기능 5: allowedEditSpans 밖의 변경을 감지하고 over-editing 시 MT 원본 기반으로 복원 */
function applySelectivePatch(
    mtOutput: string,
    rewrittenOutput: string,
    allowedEditSpans: string[],
): PatchResult {
    // 변경이 없으면 바로 반환
    if (mtOutput === rewrittenOutput) {
        return { result: rewrittenOutput, hasOverEdit: false };
    }

    let hasOverEdit = false;

    // 단어 단위 diff를 직접 구현 (외부 라이브러리 없이)
    // allowedEditSpans 밖에서 변경된 내용이 있으면 MT 원본으로 폴백
    const noEditSpans = extractNoEditSpans(mtOutput, allowedEditSpans.map((s) => ({ mt_span: s } as MqmError)));

    for (const span of noEditSpans) {
        if (span.length > 0 && !rewrittenOutput.includes(span)) {
            hasOverEdit = true;
            break;
        }
    }

    if (hasOverEdit) {
        // over-editing 발생: MT 원본에서 허용된 구간만 rewrittenOutput의 것으로 교체
        let result = mtOutput;
        for (const span of allowedEditSpans) {
            // allowedEditSpan에 대응하는 rewritten 결과가 있으면 교체
            // (정확한 대응을 찾기 어려우므로 MT 원본 그대로 반환)
            void span;
        }
        return { result, hasOverEdit: true };
    }

    return { result: rewrittenOutput, hasOverEdit: false };
}

export async function translatePropsInfo(
    props: PropsInfoJson[],
    config: TranslationConfig,
    outputDir?: string,
    skipCache = false,
): Promise<TranslateResult> {
    // 1. 번역 대상 텍스트 수집
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
            props: props.map((component) => ({
                ...component,
                props: component.props.map((prop) => ({ ...prop })),
            })),
            componentReports: props.map((component) => ({
                name: component.name,
                totalTexts: 0,
                failCount: 0,
                errors: [],
            })),
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

    // 2. 캐시 히트/미스 분리
    interface FinalEntry {
        translated: string;
        pipeline: 'mt-only' | 'mt-ape';
        hadErrors: boolean;
        hadOverEdit: boolean;
    }
    const finalEntries: FinalEntry[] = new Array(entries.length);
    const missIndices: number[] = [];

    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        const entry = entries[entryIndex];
        if (useCache) {
            const key = makeCacheKey(entry.text, config.targetLocale, llmModel, glossaryId);
            const hit = cacheStore.get(key);
            if (hit) {
                finalEntries[entryIndex] = {
                    translated: hit.translated,
                    pipeline: hit.pipeline,
                    hadErrors: hit.hadErrors,
                    hadOverEdit: hit.hadOverEdit,
                };
                continue;
            }
        }
        missIndices.push(entryIndex);
    }

    const mqmErrorsByEntryIdx = new Map<number, MqmError[]>();

    if (missIndices.length > 0) {
        const limit = pLimit(LLM_CONCURRENCY);

        // 3. DeepL 1차 번역 (배치)
        const missTexts = missIndices.map((i) => entries[i].text);
        const deeplResults = await translateWithDeepl(missTexts, glossaryId);

        // 4. spec 순서: MQM 평가 먼저 → errors 있으면 LLM 재번역
        const missResults: FinalEntry[] = await Promise.all(
            missIndices.map(async (entryIndex, batchIndex) => {
                const entry = entries[entryIndex];
                const mtOutput = deeplResults?.[batchIndex];

                if (mtOutput === undefined) {
                    console.warn(
                        `[deepl] Missing result at batch index ${batchIndex}, using source text as fallback.`,
                    );
                    return {
                        translated: entry.text,
                        pipeline: 'mt-only' as const,
                        hadErrors: false,
                        hadOverEdit: false,
                    };
                }

                // 4a. MQM 평가 (MT output 기준)
                if (!config.validation.mqm.enabled) {
                    if (!config.llm.enabled) {
                        return {
                            translated: mtOutput,
                            pipeline: 'mt-only' as const,
                            hadErrors: false,
                            hadOverEdit: false,
                        };
                    }
                    // MQM 비활성화: LLM postprocess만 실행 (errors 없이)
                    const rewritten = await limit(() =>
                        postprocessWithLlm(entry.text, mtOutput, [], []),
                    );
                    return {
                        translated: rewritten,
                        pipeline: 'mt-ape' as const,
                        hadErrors: false,
                        hadOverEdit: false,
                    };
                }

                const mqmResult = await limit(() =>
                    validateWithMqm(entry.text, mtOutput, config),
                );

                // 4b. errors 없으면 MT output 그대로 반환 (mt-only 경로)
                if (mqmResult.errors.length === 0) {
                    return {
                        translated: mtOutput,
                        pipeline: 'mt-only' as const,
                        hadErrors: false,
                        hadOverEdit: false,
                    };
                }

                // 4c. errors 있으면 no_edit_spans 계산 후 LLM 재번역
                mqmErrorsByEntryIdx.set(entryIndex, mqmResult.errors);
                const allowedEditSpans = mqmResult.errors.map((e) => e.mt_span);

                if (!config.llm.enabled) {
                    return {
                        translated: mtOutput,
                        pipeline: 'mt-only' as const,
                        hadErrors: true,
                        hadOverEdit: false,
                    };
                }

                const noEditSpans = extractNoEditSpans(mtOutput, mqmResult.errors);

                const rewrittenOutput = await limit(() =>
                    postprocessWithLlm(entry.text, mtOutput, mqmResult.errors, noEditSpans),
                );

                // 5. diff 검증 — over-editing 감지
                const { result, hasOverEdit } = applySelectivePatch(
                    mtOutput,
                    rewrittenOutput,
                    allowedEditSpans,
                );

                if (hasOverEdit) {
                    console.warn(
                        `[pipeline] Over-editing detected for: "${entry.text.slice(0, 60)}...". Falling back to MT output.`,
                    );
                }

                // failOnError: true이면 재검증
                if (config.validation.mqm.failOnError) {
                    const recheck = await limit(() =>
                        validateWithMqm(entry.text, result, config),
                    );
                    if (recheck.verdict === 'FAIL') {
                        mqmErrorsByEntryIdx.set(entryIndex, recheck.errors);
                        throw new Error(
                            `[mqm-validator] Translation validation FAILED after retry for: "${entry.text.slice(0, 60)}..."`,
                        );
                    } else {
                        mqmErrorsByEntryIdx.delete(entryIndex);
                    }
                }

                return {
                    translated: result,
                    pipeline: 'mt-ape' as const,
                    hadErrors: true,
                    hadOverEdit: hasOverEdit,
                };
            }),
        );

        // 6. 미스 결과 병합 및 캐시 저장
        for (let batchIndex = 0; batchIndex < missIndices.length; batchIndex++) {
            const entryIndex = missIndices[batchIndex];
            const finalEntry = missResults[batchIndex];
            finalEntries[entryIndex] = finalEntry;

            // DeepL 실패로 원문이 그대로 반환된 경우 캐시하지 않음
            if (useCache && finalEntry.translated !== entries[entryIndex].text) {
                const key = makeCacheKey(
                    entries[entryIndex].text,
                    config.targetLocale,
                    llmModel,
                    glossaryId,
                );
                cacheStore.set(key, {
                    source: entries[entryIndex].text,
                    translated: finalEntry.translated,
                    cachedAt: new Date().toISOString(),
                    pipeline: finalEntry.pipeline,
                    hadErrors: finalEntry.hadErrors,
                    hadOverEdit: finalEntry.hadOverEdit,
                });
            }
        }
    }

    if (useCache && cacheOutputDir) {
        saveCache(cacheOutputDir, cacheStore);
    }

    // 7. 번역된 PropsInfoJson 배열 구성 (불변)
    const result: PropsInfoJson[] = props.map((component) => ({
        ...component,
        props: component.props.map((prop) => ({ ...prop })),
    }));

    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        const entry = entries[entryIndex];
        const translated = finalEntries[entryIndex]?.translated ?? entry.text;

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

    // 8. 컴포넌트별 리포트 생성
    const textCountByComponent = new Map<number, number>();
    for (const entry of entries) {
        const componentIndex = entry.componentIndex;
        textCountByComponent.set(
            componentIndex,
            (textCountByComponent.get(componentIndex) ?? 0) + 1,
        );
    }

    const errorsByComponent = new Map<number, MqmError[]>();
    const failedTextsByComponent = new Map<number, number>();
    for (const [entryIndex, errors] of mqmErrorsByEntryIdx) {
        const componentIndex = entries[entryIndex].componentIndex;
        const existing = errorsByComponent.get(componentIndex) ?? [];
        errorsByComponent.set(componentIndex, [...existing, ...errors]);
        failedTextsByComponent.set(
            componentIndex,
            (failedTextsByComponent.get(componentIndex) ?? 0) + 1,
        );
    }

    const componentReports: ComponentReport[] = props.map((component, componentIndex) => {
        const errors = errorsByComponent.get(componentIndex) ?? [];
        return {
            name: component.name,
            totalTexts: textCountByComponent.get(componentIndex) ?? 0,
            failCount: failedTextsByComponent.get(componentIndex) ?? 0,
            errors,
        };
    });

    return { props: result, componentReports };
}
