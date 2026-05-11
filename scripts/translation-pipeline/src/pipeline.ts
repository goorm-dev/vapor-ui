import pLimit from 'p-limit';

import { processComponentBatchLifecycle } from '~/batch-lifecycle';
import { loadCache, makeCacheKey, saveCache } from '~/cache';
import type { CacheStore } from '~/cache';
import { translateComponentUnits } from '~/llm-translation';
import type { ComponentReport } from '~/report';
import {
    applyTranslationOutcomes,
    buildComponentReports,
    collectTranslationUnits,
    getTranslationUnitKey,
} from '~/translation-units';
import type {
    TranslatableDoc,
    TranslationConfig,
    TranslationOutcome,
    TranslationUnit,
} from '~/types';

const LLM_CONCURRENCY = 10;
const TRANSLATION_BATCH_SIZE = 20;

export interface BatchFallbackEntry {
    componentName: string;
    reason: string;
}

export interface TranslateResult {
    props: TranslatableDoc[];
    componentReports: ComponentReport[];
    batchFallbacks: BatchFallbackEntry[];
}

function cloneProps(props: TranslatableDoc[]): TranslatableDoc[] {
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
    props: TranslatableDoc[],
    config: TranslationConfig,
    outputDir?: string,
    verbose = false,
): Promise<TranslateResult> {
    const totalStartedAt = Date.now();
    const log = (message: string): void => {
        if (verbose) console.error(`[i18n] ${message}`);
    };

    const progress = (message: string): void => {
        console.error(`[i18n] ${message}`);
    };

    const units = measureSync(log, 'collectTranslationUnits', () => collectTranslationUnits(props));
    log(`collected ${units.length} translatable texts from ${props.length} components`);
    progress(`starting ${props.length} component(s) — ${units.length} translatable text(s)`);

    if (units.length === 0) {
        const clonedProps = measureSync(log, 'cloneProps', () => cloneProps(props));
        const componentReports = measureSync(log, 'buildComponentReports', () =>
            buildComponentReports(props, units, new Map()),
        );
        logTiming(log, 'translatePropsInfo total', totalStartedAt);
        progress(`done: ${props.length} component(s) — nothing to translate`);
        return {
            props: clonedProps,
            componentReports,
            batchFallbacks: [],
        };
    }

    const cacheOutputDir = outputDir ?? '';
    const useCache = !config.skipCache;
    let cacheStore: CacheStore = new Map();
    if (useCache && cacheOutputDir) {
        cacheStore = measureSync(log, 'loadCache', () => loadCache(cacheOutputDir));
    }

    const outcomes = new Map<string, TranslationOutcome>();
    const validationLimit = pLimit(LLM_CONCURRENCY);
    const componentGroups = groupByComponent(units);
    const batchFallbacks: BatchFallbackEntry[] = [];
    let totalHits = 0;
    let totalMisses = 0;

    const componentEntries = [...componentGroups.entries()];
    const totalComponents = componentEntries.length;
    let componentCount = 0;

    for (const [componentIndex, componentUnits] of componentEntries) {
        const componentName = props[componentIndex]?.name ?? `component#${componentIndex}`;
        componentCount++;
        progress(`[${componentCount}/${totalComponents}] ${componentName}`);
        const missUnits: TranslationUnit[] = [];
        let componentHits = 0;

        for (const unit of componentUnits) {
            const cacheEntry = useCache
                ? cacheStore.get(makeCacheKey(unit.source, config))
                : undefined;
            if (cacheEntry) {
                outcomes.set(
                    getTranslationUnitKey(unit),
                    cacheHitOutcome(unit, cacheEntry.translated),
                );
                componentHits++;
            } else {
                missUnits.push(unit);
            }
        }

        totalHits += componentHits;
        totalMisses += missUnits.length;
        log(
            `cache (${componentName}): ${componentHits} hit, ${missUnits.length} miss (running total: ${totalHits} hit / ${totalMisses} miss)`,
        );

        if (missUnits.length > 0) {
            for (const [chunkIndex, componentChunk] of chunkArray(
                missUnits,
                TRANSLATION_BATCH_SIZE,
            ).entries()) {
                const chunkLabel =
                    missUnits.length > TRANSLATION_BATCH_SIZE
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
                for (const reason of processed.fallbackReasons) {
                    batchFallbacks.push({ componentName, reason });
                }

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

        // Save cache after each component so partial progress survives crashes
        // and so subsequent components can hit translations produced earlier in this run.
        if (useCache && cacheOutputDir) {
            measureSync(log, `saveCache ${componentName}`, () =>
                saveCache(cacheOutputDir, cacheStore),
            );
        }
    }

    if (!useCache || !cacheOutputDir) {
        log(`cache: save skipped (${useCache ? 'no outputDir' : 'skipCache=true'})`);
    } else {
        log(`cache: final size ${cacheStore.size} entries`);
    }

    if (batchFallbacks.length > 0) {
        console.warn(
            `[i18n] batch fallback summary: ${batchFallbacks.length} chunk(s) fell back. ${batchFallbacks
                .map((entry) => `${entry.componentName}: ${entry.reason}`)
                .join('; ')}`,
        );
    }

    const translatedProps = measureSync(log, 'applyTranslationOutcomes', () =>
        applyTranslationOutcomes(props, units, outcomes),
    );
    const componentReports = measureSync(log, 'buildComponentReports', () =>
        buildComponentReports(props, units, outcomes),
    );

    log(`completed ${translatedProps.length} components`);
    logTiming(log, 'translatePropsInfo total', totalStartedAt);
    progress(`done: ${translatedProps.length} component(s) in ${elapsedMs(totalStartedAt)}ms`);

    return { props: translatedProps, componentReports, batchFallbacks };
}
