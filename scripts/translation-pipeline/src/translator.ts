import { processBatchLifecycle } from '~/batch/lifecycle';
import { type CacheStore, loadCache, makeCacheKey, saveCache } from '~/cache';
import {
    type TranslatableDoc,
    type TranslationOutcome,
    type TranslationUnit,
    getTranslationUnitKey,
    makeOutcome,
} from '~/domain';
import { type ComponentReport, buildComponentReports } from '~/report';
import { translateUnits } from '~/translate';
import { chunkArray, errorMessage } from '~/util';

const TRANSLATION_BATCH_SIZE = 20;
const MQM_BATCH_SIZE = 74;
const BATCH_CONCURRENCY = 16;

// ─── Translation Units ────────────────────────────────────────────────────────

function collectTranslationUnits(docs: TranslatableDoc[]): TranslationUnit[] {
    const units: TranslationUnit[] = [];

    for (const component of docs) {
        const componentDisplayName = component.displayName;
        if (component.description) {
            units.push({
                kind: 'component.description',
                componentDisplayName,
                source: component.description,
            });
        }

        for (const prop of component.props) {
            if (prop.description) {
                units.push({
                    kind: 'prop.description',
                    componentDisplayName,
                    propName: prop.name,
                    source: prop.description,
                });
            }
        }
    }

    const seen = new Set<string>();
    for (const unit of units) {
        const key = getTranslationUnitKey(unit);
        if (seen.has(key)) {
            throw new Error(`Duplicate translation unit key: ${key}`);
        }
        seen.add(key);
    }

    return units;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupBySource(units: TranslationUnit[]): Map<string, TranslationUnit[]> {
    const groups = new Map<string, TranslationUnit[]>();
    for (const unit of units) {
        const current = groups.get(unit.source) ?? [];
        current.push(unit);
        groups.set(unit.source, current);
    }
    return groups;
}

async function runInWaves<T>(batches: T[], task: (batch: T) => Promise<void>): Promise<void> {
    for (const wave of chunkArray(batches, BATCH_CONCURRENCY)) {
        await Promise.all(wave.map(task));
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface TranslateResult {
    translations: Map<string, string>;
    componentReports: ComponentReport[];
    batchFallbacks: string[];
}

export async function translateDescriptions(
    docs: TranslatableDoc[],
    outputDir?: string,
): Promise<TranslateResult> {
    const totalStartedAt = Date.now();
    const progress = (message: string): void => {
        console.error(`[i18n] ${message}`);
    };

    const units = collectTranslationUnits(docs);
    progress(`starting ${docs.length} component(s) — ${units.length} translatable text(s)`);

    const cacheStore: CacheStore = outputDir ? loadCache(outputDir) : new Map();

    const outcomes = new Map<string, TranslationOutcome>();
    const batchFallbacks: string[] = [];

    const representatives = [...groupBySource(units).values()].map((group) => group[0]);
    progress(`deduplicated: ${units.length} text(s) → ${representatives.length} unique source(s)`);

    const missing: TranslationUnit[] = [];
    for (const representative of representatives) {
        const cached = cacheStore.get(makeCacheKey(representative.source));
        if (cached !== undefined) {
            outcomes.set(representative.source, makeOutcome(cached, 'cache_hit'));
        } else {
            missing.push(representative);
        }
    }
    progress(`cache: ${representatives.length - missing.length} hit, ${missing.length} miss`);

    const translations = new Map<string, string>();
    const translationBatches = chunkArray(missing, TRANSLATION_BATCH_SIZE);
    progress(`translating ${missing.length} source(s) in ${translationBatches.length} batch(es)`);

    await runInWaves(translationBatches, async (batch) => {
        try {
            for (const [key, translated] of await translateUnits(batch)) {
                translations.set(key, translated);
            }
        } catch (error) {
            batchFallbacks.push(`translation batch failed: ${errorMessage(error)}`);
            for (const unit of batch) {
                outcomes.set(unit.source, makeOutcome(unit.source, 'translation_failed'));
            }
        }
    });

    const translatedUnits = missing.filter((unit) => translations.has(getTranslationUnitKey(unit)));
    const mqmBatches = chunkArray(translatedUnits, MQM_BATCH_SIZE);
    progress(`evaluating ${translatedUnits.length} source(s) in ${mqmBatches.length} batch(es)`);

    await runInWaves(mqmBatches, async (batch) => {
        const processed = await processBatchLifecycle(batch, translations);
        batchFallbacks.push(...processed.batchFailureReasons);
        for (const [unit, outcome] of processed.outcomes) {
            outcomes.set(unit.source, outcome);
            if (outcome.assurance === 'verified') {
                cacheStore.set(makeCacheKey(unit.source), outcome.translated);
            }
        }
    });

    if (outputDir) {
        saveCache(outputDir, cacheStore);
    }

    if (batchFallbacks.length > 0) {
        console.warn(
            `[i18n] batch failure summary: ${batchFallbacks.length} chunk(s) degraded. ${batchFallbacks.join('; ')}`,
        );
    }

    const componentReports = buildComponentReports(docs, units, outcomes);
    const finalTranslations = new Map(
        units.map((unit) => [
            getTranslationUnitKey(unit),
            outcomes.get(unit.source)?.translated ?? unit.source,
        ]),
    );

    progress(`done: ${docs.length} component(s) in ${Math.max(0, Date.now() - totalStartedAt)}ms`);

    return { translations: finalTranslations, componentReports, batchFallbacks };
}
