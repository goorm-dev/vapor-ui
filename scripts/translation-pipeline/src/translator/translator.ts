import { type CacheStore, loadCache, makeCacheKey, saveCache } from '~/cache/cache';
import {
    type BatchFallbackEntry,
    type ComponentReport,
    buildComponentReports,
} from '~/report/report';
import { translateUnits } from '~/translation/translate';
import { processBatchLifecycle } from '~/translator/batch-lifecycle';
import {
    type TranslatableDoc,
    type TranslationOutcome,
    type TranslationUnit,
    getTranslationUnitKey,
    makeOutcome,
} from '~/types';
import { chunkArray, errorMessage } from '~/util';

const TRANSLATION_BATCH_SIZE = 20;
/** 60초 타임아웃 × 실측 81 tok/s ÷ 유닛당 출력 토큰 ÷ 안전계수 2 (KAN-11) */
const MQM_BATCH_SIZE = 74;
const BATCH_CONCURRENCY = 16;


// ─── Translation Units ────────────────────────────────────────────────────────

function collectTranslationUnits(props: TranslatableDoc[]): TranslationUnit[] {
    const units: TranslationUnit[] = [];

    for (let componentIndex = 0; componentIndex < props.length; componentIndex++) {
        const component = props[componentIndex];
        const componentName = component.name;
        if (component.description) {
            units.push({
                id: 'component.description',
                kind: 'component.description',
                ownerName: component.name,
                source: component.description,
                componentIndex,
                componentName,
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
                    componentName,
                    propIndex,
                });
            }
        }
    }

    return units;
}

function applyTranslationOutcomes(
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

/** 같은 원문을 공유하는 유닛들. 74.3%가 중복이므로 고유 원문만 번역한다 (KAN-11). */
function groupBySource(units: TranslationUnit[]): Map<string, TranslationUnit[]> {
    const groups = new Map<string, TranslationUnit[]>();
    for (const unit of units) {
        const current = groups.get(unit.source) ?? [];
        current.push(unit);
        groups.set(unit.source, current);
    }
    return groups;
}

/** 손으로 만든 워커 풀 — 의존성 하나(meow)를 유지하기 위해 p-limit을 쓰지 않는다. */
async function forEachWithConcurrency<T>(
    items: T[],
    limit: number,
    task: (item: T) => Promise<void>,
): Promise<void> {
    let cursor = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (cursor < items.length) {
            await task(items[cursor++]);
        }
    });
    await Promise.all(workers);
}

// ─── Public API ───────────────────────────────────────────────────────────────


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

    const cacheOutputDir = outputDir ?? '';
    let cacheStore: CacheStore = new Map();
    if (cacheOutputDir) {
        cacheStore = loadCache(cacheOutputDir);
    }

    const outcomes = new Map<string, TranslationOutcome>();
    const batchFallbacks: BatchFallbackEntry[] = [];

    // ── 중복 제거: 고유 원문 하나당 대표 유닛 하나 ──
    const groups = groupBySource(units);
    const representatives = [...groups.values()].map((group) => group[0]);
    progress(`deduplicated: ${units.length} text(s) → ${representatives.length} unique source(s)`);

    const fanOut = (representative: TranslationUnit, outcome: TranslationOutcome): void => {
        for (const unit of groups.get(representative.source) ?? []) {
            outcomes.set(getTranslationUnitKey(unit), { ...outcome, id: unit.id });
        }
    };

    // ── 캐시 조회 ──
    const missing: TranslationUnit[] = [];
    for (const representative of representatives) {
        const cached = cacheStore.get(makeCacheKey(representative.source));
        if (cached !== undefined) {
            fanOut(representative, makeOutcome(representative, cached, 'cache_hit'));
        } else {
            missing.push(representative);
        }
    }
    progress(`cache: ${representatives.length - missing.length} hit, ${missing.length} miss`);

    // ── 1단계: 번역 전수 ──
    const translations = new Map<string, string>();
    const translationBatches = chunkArray(missing, TRANSLATION_BATCH_SIZE);
    progress(`translating ${missing.length} source(s) in ${translationBatches.length} batch(es)`);

    await forEachWithConcurrency(translationBatches, BATCH_CONCURRENCY, async (batch) => {
        try {
            for (const [key, translated] of await translateUnits(batch)) {
                translations.set(key, translated);
            }
        } catch (error) {
            batchFallbacks.push({
                componentName: batch[0]?.componentName ?? '-',
                reason: `translation batch failed: ${errorMessage(error)}`,
            });
            for (const unit of batch) {
                // 번역 콜이 실패한 유닛은 영어 원문을 그대로 쓴다 — 배치 하나가 실행 전체를 죽이지 않게.
                fanOut(unit, makeOutcome(unit, unit.source, 'translation_failed'));
            }
        }
    });

    // ── 2단계: MQM 전수 (컴포넌트 횡단 배치) ──
    const translatedUnits = missing.filter((unit) => translations.has(getTranslationUnitKey(unit)));
    const mqmBatches = chunkArray(translatedUnits, MQM_BATCH_SIZE);
    progress(`evaluating ${translatedUnits.length} source(s) in ${mqmBatches.length} batch(es)`);

    await forEachWithConcurrency(mqmBatches, BATCH_CONCURRENCY, async (batch) => {
        const processed = await processBatchLifecycle(batch, translations);
        for (const reason of processed.batchFailureReasons) {
            batchFallbacks.push({ componentName: batch[0]?.componentName ?? '-', reason });
        }
        for (const [unit, outcome] of processed.outcomes) {
            fanOut(unit, outcome);
            if (outcome.assurance === 'verified') {
                cacheStore.set(makeCacheKey(unit.source), outcome.translated);
            }
        }
    });

    if (cacheOutputDir) {
        saveCache(cacheOutputDir, cacheStore);
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
