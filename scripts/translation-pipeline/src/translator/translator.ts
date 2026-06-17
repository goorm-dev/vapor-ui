import { type CacheStore, loadCache, makeCacheKey, saveCache } from '~/cache/cache';
import { type ComponentReport, buildComponentReports } from '~/report/report';
import { translateComponentUnits } from '~/translation/translate';
import { processComponentLifecycle } from '~/translator/batch-lifecycle';
import type { TranslatableDoc, TranslationOutcome, TranslationUnit } from '~/types';

const TRANSLATION_BATCH_SIZE = 20;

// ─── Translation Units ────────────────────────────────────────────────────────

export function getTranslationUnitKey(unit: TranslationUnit): string {
    return `${unit.componentIndex}:${unit.id}`;
}

export function collectTranslationUnits(props: TranslatableDoc[]): TranslationUnit[] {
    const units: TranslationUnit[] = [];

    for (let componentIndex = 0; componentIndex < props.length; componentIndex++) {
        const component = props[componentIndex];
        if (component.description) {
            units.push({
                id: 'component.description',
                kind: 'component.description',
                ownerName: component.name,
                source: component.description,
                componentIndex,
            });
        }

        for (let propIndex = 0; propIndex < component.props.length; propIndex++) {
            const prop = component.props[propIndex];
            if (prop.description) {
                units.push({
                    id: `props[${propIndex}].${prop.name}.description`,
                    kind: 'prop.description',
                    ownerName: prop.name,
                    source: prop.description,
                    componentIndex,
                    propIndex,
                });
            }
        }
    }

    return units;
}

export function applyTranslationOutcomes(
    props: TranslatableDoc[],
    units: TranslationUnit[],
    outcomes: Map<string, TranslationOutcome>,
): TranslatableDoc[] {
    const result: TranslatableDoc[] = props.map((component) => ({
        ...component,
        props: component.props.map((prop) => ({ ...prop })),
    }));

    for (const unit of units) {
        const translated = outcomes.get(getTranslationUnitKey(unit))?.translated ?? unit.source;
        if (unit.kind === 'component.description') {
            result[unit.componentIndex] = {
                ...result[unit.componentIndex],
                description: translated,
            };
            continue;
        }

        if (unit.propIndex === undefined) continue;
        const component = result[unit.componentIndex];
        const nextProps = [...component.props];
        nextProps[unit.propIndex] = { ...nextProps[unit.propIndex], description: translated };
        result[unit.componentIndex] = { ...component, props: nextProps };
    }

    return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cacheHitOutcome(unit: TranslationUnit, translated: string): TranslationOutcome {
    return {
        id: unit.id,
        translated,
        assurance: 'verified',
        reportable: false,
        reason: 'cache_hit',
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

// ─── Public API ───────────────────────────────────────────────────────────────

export interface BatchFallbackEntry {
    componentName: string;
    reason: string;
}

export interface TranslateResult {
    props: TranslatableDoc[];
    componentReports: ComponentReport[];
    batchFallbacks: BatchFallbackEntry[];
}

export async function translatePropsInfo(
    props: TranslatableDoc[],
    outputDir?: string,
): Promise<TranslateResult> {
    const totalStartedAt = Date.now();
    const progress = (message: string): void => {
        console.error(`[i18n] ${message}`);
    };

    const units = collectTranslationUnits(props);
    progress(`starting ${props.length} component(s) — ${units.length} translatable text(s)`);

    if (units.length === 0) {
        const clonedProps = props.map((component) => ({
            ...component,
            props: component.props.map((prop) => ({ ...prop })),
        }));
        const componentReports = buildComponentReports(props, units, new Map());
        progress(`done: ${props.length} component(s) — nothing to translate`);
        return { props: clonedProps, componentReports, batchFallbacks: [] };
    }

    const cacheOutputDir = outputDir ?? '';
    let cacheStore: CacheStore = new Map();
    if (cacheOutputDir) {
        cacheStore = loadCache(cacheOutputDir);
    }

    const outcomes = new Map<string, TranslationOutcome>();
    const componentGroups = groupByComponent(units);
    const batchFallbacks: BatchFallbackEntry[] = [];

    const componentEntries = [...componentGroups.entries()];
    const totalComponents = componentEntries.length;
    let componentCount = 0;

    for (const [componentIndex, componentUnits] of componentEntries) {
        const componentName = props[componentIndex]?.name ?? `component#${componentIndex}`;
        componentCount++;
        progress(`[${componentCount}/${totalComponents}] ${componentName}`);
        const missUnits: TranslationUnit[] = [];

        for (const unit of componentUnits) {
            const cacheEntry = cacheStore.get(makeCacheKey(unit.source));
            if (cacheEntry) {
                outcomes.set(
                    getTranslationUnitKey(unit),
                    cacheHitOutcome(unit, cacheEntry.translated),
                );
            } else {
                missUnits.push(unit);
            }
        }

        if (missUnits.length > 0) {
            for (const componentChunk of chunkArray(missUnits, TRANSLATION_BATCH_SIZE)) {
                const translations = await translateComponentUnits(componentName, componentChunk);

                const processed = await processComponentLifecycle(
                    componentName,
                    componentChunk,
                    translations,
                );
                for (const reason of processed.batchFailureReasons) {
                    batchFallbacks.push({ componentName, reason });
                }

                for (const [unit, outcome] of processed.outcomes) {
                    outcomes.set(getTranslationUnitKey(unit), outcome);
                    if (outcome.assurance === 'verified') {
                        cacheStore.set(makeCacheKey(unit.source), {
                            source: unit.source,
                            translated: outcome.translated,
                        });
                    }
                }
            }
        }

        if (cacheOutputDir) {
            saveCache(cacheOutputDir, cacheStore);
        }
    }

    if (batchFallbacks.length > 0) {
        console.warn(
            `[i18n] batch failure summary: ${batchFallbacks.length} chunk(s) degraded. ${batchFallbacks
                .map((entry) => entry.reason)
                .join('; ')}`,
        );
    }

    const translatedProps = applyTranslationOutcomes(props, units, outcomes);
    const componentReports = buildComponentReports(props, units, outcomes);

    progress(
        `done: ${translatedProps.length} component(s) in ${Math.max(0, Date.now() - totalStartedAt)}ms`,
    );

    return { props: translatedProps, componentReports, batchFallbacks };
}
