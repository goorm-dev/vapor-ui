import type { PropsInfoJson } from '~/models/output';
import type { CacheEntry, CacheStore } from '~/translate/cache';
import { makeCacheKey } from '~/translate/cache';
import type { ComponentReport } from '~/translate/report';
import type { MqmError, TranslationConfig } from '~/translate/types';

export interface TextEntry {
    text: string;
    kind: 'component' | 'prop';
    componentIndex: number;
    propIndex?: number;
}

export interface FinalEntry {
    translated: string;
    /** LLM 호출 실패로 인해 MQM 검증 또는 재번역이 degraded 처리된 경우 */
    llmDegraded?: true;
    initial: { verdict: 'PASS' | 'FAIL'; errors: MqmError[] };
    final: { verdict: 'PASS' | 'FAIL'; errors: MqmError[] };
}

export interface CachePartition {
    finalEntries: (FinalEntry | undefined)[];
    missIndices: number[];
    cacheHits: number;
}

export function collectTextEntries(props: PropsInfoJson[]): TextEntry[] {
    const entries: TextEntry[] = [];
    for (let componentIndex = 0; componentIndex < props.length; componentIndex++) {
        const component = props[componentIndex];
        if (component.description) {
            entries.push({ text: component.description, kind: 'component', componentIndex });
        }
        for (let propIndex = 0; propIndex < component.props.length; propIndex++) {
            const prop = component.props[propIndex];
            if (prop.description) {
                entries.push({ text: prop.description, kind: 'prop', componentIndex, propIndex });
            }
        }
    }
    return entries;
}

export function partitionByCache(
    entries: TextEntry[],
    cacheStore: CacheStore,
    config: TranslationConfig,
    postprocessModel: string,
    validationModel: string,
    glossaryId: string,
): CachePartition {
    const finalEntries: (FinalEntry | undefined)[] = new Array(entries.length);
    const missIndices: number[] = [];
    let cacheHits = 0;

    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        const entry = entries[entryIndex];
        const key = makeCacheKey(
            entry.text,
            config.targetLocale,
            config.llm.enabled,
            config.validation.mqm.enabled,
            postprocessModel,
            validationModel,
            glossaryId,
        );
        const hit = cacheStore.get(key);
        if (hit) {
            finalEntries[entryIndex] = cacheEntryToFinalEntry(hit);
            cacheHits++;
        } else {
            missIndices.push(entryIndex);
        }
    }

    return { finalEntries, missIndices, cacheHits };
}

function cacheEntryToFinalEntry(hit: CacheEntry): FinalEntry {
    // Cache hits are treated as clean results: a previously cached translation
    // already went through the full pipeline once. Report verdicts are reset
    // to PASS — fresh validation/postprocess data is intentionally not preserved.
    return {
        translated: hit.translated,
        initial: { verdict: 'PASS', errors: [] },
        final: { verdict: 'PASS', errors: [] },
    };
}

export function applyTranslations(
    props: PropsInfoJson[],
    entries: TextEntry[],
    finalEntries: (FinalEntry | undefined)[],
): PropsInfoJson[] {
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

    return result;
}

export function buildComponentReports(
    props: PropsInfoJson[],
    entries: TextEntry[],
    finalEntries: (FinalEntry | undefined)[],
): ComponentReport[] {
    const textCountByComponent = new Map<number, number>();
    for (const entry of entries) {
        textCountByComponent.set(
            entry.componentIndex,
            (textCountByComponent.get(entry.componentIndex) ?? 0) + 1,
        );
    }

    const initialByComponent = new Map<number, { failCount: number; errors: MqmError[] }>();
    const finalByComponent = new Map<number, { failCount: number; errors: MqmError[] }>();

    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        const entry = entries[entryIndex];
        const result = finalEntries[entryIndex];
        if (!result) continue;

        if (result.initial.verdict === 'FAIL') {
            const current = initialByComponent.get(entry.componentIndex) ?? {
                failCount: 0,
                errors: [],
            };
            initialByComponent.set(entry.componentIndex, {
                failCount: current.failCount + 1,
                errors: [...current.errors, ...result.initial.errors],
            });
        }

        if (result.final.verdict === 'FAIL') {
            const current = finalByComponent.get(entry.componentIndex) ?? {
                failCount: 0,
                errors: [],
            };
            finalByComponent.set(entry.componentIndex, {
                failCount: current.failCount + 1,
                errors: [...current.errors, ...result.final.errors],
            });
        }
    }

    const degradedCountByComponent = new Map<number, number>();
    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        const entry = entries[entryIndex];
        const result = finalEntries[entryIndex];
        if (result?.llmDegraded) {
            degradedCountByComponent.set(
                entry.componentIndex,
                (degradedCountByComponent.get(entry.componentIndex) ?? 0) + 1,
            );
        }
    }

    return props.map((component, componentIndex) => {
        const initial = initialByComponent.get(componentIndex) ?? { failCount: 0, errors: [] };
        const final = finalByComponent.get(componentIndex) ?? { failCount: 0, errors: [] };
        return {
            name: component.name,
            totalTexts: textCountByComponent.get(componentIndex) ?? 0,
            initial,
            final,
            failCount: final.failCount,
            errors: final.errors,
            degradedCount: degradedCountByComponent.get(componentIndex) ?? 0,
        };
    });
}
