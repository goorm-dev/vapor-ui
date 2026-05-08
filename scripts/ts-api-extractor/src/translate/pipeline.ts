import pLimit from 'p-limit';

import type { PropsInfoJson } from '~/models/output';
import { loadCache, makeCacheKey, saveCache } from '~/translate/cache';
import type { CacheStore } from '~/translate/cache';
import { processTranslationLifecycle } from '~/translate/lifecycle';
import { translateComponentUnits } from '~/translate/llm-translation';
import type { ComponentReport } from '~/translate/report';
import {
    applyTranslationOutcomes,
    buildComponentReports,
    collectTranslationUnits,
    getTranslationUnitKey,
} from '~/translate/translation-units';
import type { TranslationConfig, TranslationOutcome, TranslationUnit } from '~/translate/types';

const LLM_CONCURRENCY = 5;

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

export async function translatePropsInfo(
    props: PropsInfoJson[],
    config: TranslationConfig,
    outputDir?: string,
    verbose = false,
): Promise<TranslateResult> {
    const log = (message: string): void => {
        if (verbose) console.error(`[i18n] ${message}`);
    };

    const units = collectTranslationUnits(props);
    log(`collected ${units.length} translatable texts from ${props.length} components`);

    if (units.length === 0) {
        return {
            props: cloneProps(props),
            componentReports: buildComponentReports(props, units, new Map()),
        };
    }

    const cacheOutputDir = outputDir ?? '';
    const useCache = !config.skipCache;
    let cacheStore: CacheStore = new Map();
    if (useCache && cacheOutputDir) {
        cacheStore = loadCache(cacheOutputDir);
    }

    const outcomes = new Map<string, TranslationOutcome>();
    const missUnits: TranslationUnit[] = [];
    let cacheHits = 0;

    for (const unit of units) {
        const cacheEntry = useCache ? cacheStore.get(makeCacheKey(unit.source, config)) : undefined;
        if (cacheEntry) {
            outcomes.set(getTranslationUnitKey(unit), cacheHitOutcome(unit, cacheEntry.translated));
            cacheHits++;
        } else {
            missUnits.push(unit);
        }
    }

    log(`cache: ${cacheHits} hit, ${missUnits.length} miss`);

    if (missUnits.length > 0) {
        const validationLimit = pLimit(LLM_CONCURRENCY);
        const missGroups = groupByComponent(missUnits);

        for (const [componentIndex, componentUnits] of missGroups) {
            const componentName = props[componentIndex]?.name ?? `component#${componentIndex}`;
            log(`translation: requesting ${componentUnits.length} texts for ${componentName}`);
            const translations = await translateComponentUnits(
                componentName,
                componentUnits,
                config,
            );

            const processed = await Promise.all(
                componentUnits.map(async (unit) => {
                    const translated = translations.get(unit.id);
                    if (translated === undefined) {
                        throw new Error(`Missing validated translation id: ${unit.id}`);
                    }
                    const outcome = await processTranslationLifecycle(
                        unit,
                        translated,
                        config,
                        validationLimit,
                        log,
                    );
                    return [unit, outcome] as const;
                }),
            );

            for (const [unit, outcome] of processed) {
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

    if (useCache && cacheOutputDir) {
        saveCache(cacheOutputDir, cacheStore);
        log(`cache: saved ${cacheStore.size} entries`);
    } else {
        log(`cache: save skipped (${useCache ? 'no outputDir' : 'skipCache=true'})`);
    }

    const translatedProps = applyTranslationOutcomes(props, units, outcomes);
    const componentReports = buildComponentReports(props, units, outcomes);

    log(`completed ${translatedProps.length} components`);

    return { props: translatedProps, componentReports };
}
