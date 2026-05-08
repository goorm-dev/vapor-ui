import pLimit from 'p-limit';

import type { PropsInfoJson } from '~/models/output';
import { processComponentBatchLifecycle } from '~/translate/batch-lifecycle';
import { loadCache, makeCacheKey, saveCache } from '~/translate/cache';
import type { CacheStore } from '~/translate/cache';
import { translateComponentUnits } from '~/translate/llm-translation';
import type { ComponentReport } from '~/translate/report';
import {
    applyTranslationOutcomes,
    buildComponentReports,
    collectTranslationUnits,
    getTranslationUnitKey,
} from '~/translate/translation-units';
import type { TranslationConfig, TranslationOutcome, TranslationUnit } from '~/translate/types';

const LLM_CONCURRENCY = 10;
const TRANSLATION_BATCH_SIZE = 20;

export interface TranslateResult {
    props: PropsInfoJson[];
    componentReports: ComponentReport[];
}

function cloneProps(props: PropsInfoJson[]): PropsInfoJson[] {
    return props.map((component) => ({
        ...component,
        props: component.props.map((prop) => ({ ...prop })),
    }));
}

function cacheHitOutcome(unit: TranslationUnit, translated: string): TranslationOutcome {
    return {
        id: unit.id,
        source: unit.source,
        translated,
        assurance: 'verified',
        reportable: false,
        reason: 'cache_hit',
        events: [{ stage: 'cache', message: 'Verified translation loaded from cache.' }],
    };
}

function groupByComponent(units: TranslationUnit[]): Map<number, TranslationUnit[]> {
    const groups = new Map<number, TranslationUnit[]>();
    for (const unit of units) {
        const current = groups.get(unit.componentIndex) ?? [];
        current.push(unit);
        groups.set(unit.componentIndex, current);
    }
    return groups;
}

function chunkArray<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }
    return chunks;
}

function elapsedMs(startedAt: number): number {
    return Math.max(0, Date.now() - startedAt);
}

function logTiming(log: (message: string) => void, label: string, startedAt: number): void {
    log(`timing: ${label} ${elapsedMs(startedAt)}ms`);
}

function measureSync<T>(log: (message: string) => void, label: string, fn: () => T): T {
    const startedAt = Date.now();
    try {
        return fn();
    } finally {
        logTiming(log, label, startedAt);
    }
}

async function measureAsync<T>(
    log: (message: string) => void,
    label: string,
    fn: () => Promise<T>,
): Promise<T> {
    const startedAt = Date.now();
    try {
        return await fn();
    } finally {
        logTiming(log, label, startedAt);
    }
}

export async function translatePropsInfo(
    props: PropsInfoJson[],
    config: TranslationConfig,
    outputDir?: string,
    verbose = false,
): Promise<TranslateResult> {
    const totalStartedAt = Date.now();
    const log = (message: string): void => {
        if (verbose) console.error(`[i18n] ${message}`);
    };

    const units = measureSync(log, 'collectTranslationUnits', () => collectTranslationUnits(props));
    log(`collected ${units.length} translatable texts from ${props.length} components`);

    if (units.length === 0) {
        const clonedProps = measureSync(log, 'cloneProps', () => cloneProps(props));
        const componentReports = measureSync(log, 'buildComponentReports', () =>
            buildComponentReports(props, units, new Map()),
        );
        logTiming(log, 'translatePropsInfo total', totalStartedAt);
        return {
            props: clonedProps,
            componentReports,
        };
    }

    const cacheOutputDir = outputDir ?? '';
    const useCache = !config.skipCache;
    let cacheStore: CacheStore = new Map();
    if (useCache && cacheOutputDir) {
        cacheStore = measureSync(log, 'loadCache', () => loadCache(cacheOutputDir));
    }

    const outcomes = new Map<string, TranslationOutcome>();
    const { cacheHits, missUnits } = measureSync(log, 'resolveCacheMisses', () => {
        const misses: TranslationUnit[] = [];
        let hits = 0;

        for (const unit of units) {
            const cacheEntry = useCache
                ? cacheStore.get(makeCacheKey(unit.source, config))
                : undefined;
            if (cacheEntry) {
                outcomes.set(
                    getTranslationUnitKey(unit),
                    cacheHitOutcome(unit, cacheEntry.translated),
                );
                hits++;
            } else {
                misses.push(unit);
            }
        }

        return { cacheHits: hits, missUnits: misses };
    });

    log(`cache: ${cacheHits} hit, ${missUnits.length} miss`);

    if (missUnits.length > 0) {
        const validationLimit = pLimit(LLM_CONCURRENCY);
        const missGroups = groupByComponent(missUnits);
        const batchFallbackReasons: string[] = [];

        for (const [componentIndex, componentUnits] of missGroups) {
            const componentName = props[componentIndex]?.name ?? `component#${componentIndex}`;
            for (const [chunkIndex, componentChunk] of chunkArray(
                componentUnits,
                TRANSLATION_BATCH_SIZE,
            ).entries()) {
                const chunkLabel =
                    componentUnits.length > TRANSLATION_BATCH_SIZE
                        ? `${componentName}#${chunkIndex + 1}`
                        : componentName;
                log(`translation: requesting ${componentChunk.length} texts for ${chunkLabel}`);
                const translations = await measureAsync(
                    log,
                    `translateComponentUnits ${chunkLabel}`,
                    () => translateComponentUnits(componentName, componentChunk, config, log),
                );

                const processed = await processComponentBatchLifecycle(
                    componentName,
                    componentChunk,
                    translations,
                    config,
                    validationLimit,
                    log,
                );
                batchFallbackReasons.push(...processed.fallbackReasons);

                for (const [unit, outcome] of processed.outcomes) {
                    outcomes.set(getTranslationUnitKey(unit), outcome);
                    if (useCache && outcome.assurance === 'verified') {
                        cacheStore.set(makeCacheKey(unit.source, config), {
                            source: unit.source,
                            translated: outcome.translated,
                        });
                    }
                }
            }
        }

        if (batchFallbackReasons.length > 0) {
            console.warn(
                `[i18n] batch fallback summary: ${batchFallbackReasons.length} chunk(s) fell back. ${batchFallbackReasons.join('; ')}`,
            );
        }
    }

    if (useCache && cacheOutputDir) {
        measureSync(log, 'saveCache', () => saveCache(cacheOutputDir, cacheStore));
        log(`cache: saved ${cacheStore.size} entries`);
    } else {
        log(`cache: save skipped (${useCache ? 'no outputDir' : 'skipCache=true'})`);
    }

    const translatedProps = measureSync(log, 'applyTranslationOutcomes', () =>
        applyTranslationOutcomes(props, units, outcomes),
    );
    const componentReports = measureSync(log, 'buildComponentReports', () =>
        buildComponentReports(props, units, outcomes),
    );

    log(`completed ${translatedProps.length} components`);
    logTiming(log, 'translatePropsInfo total', totalStartedAt);

    return { props: translatedProps, componentReports };
}
