import { validateBatchWithMqm } from '~/translate/batch-mqm-validator';
import { postprocessBatchWithLlm } from '~/translate/batch-postprocess';
import { processTranslationLifecycle } from '~/translate/lifecycle';
import type {
    MqmResult,
    TranslationConfig,
    TranslationEvent,
    TranslationOutcome,
    TranslationUnit,
} from '~/translate/types';

type LimitFn = <T>(fn: () => Promise<T>) => Promise<T>;

const MQM_BATCH_SIZE = 10;
const POSTPROCESS_BATCH_SIZE = 10;

export interface BatchLifecycleResult {
    outcomes: [TranslationUnit, TranslationOutcome][];
    fallbackReasons: string[];
}

interface FailedUnit {
    unit: TranslationUnit;
    initialTranslation: string;
    initialEvaluation: MqmResult;
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

async function measureAsync<T>(
    log: (message: string) => void,
    label: string,
    fn: () => Promise<T>,
): Promise<T> {
    const startedAt = Date.now();
    try {
        return await fn();
    } finally {
        log(`timing: ${label} ${elapsedMs(startedAt)}ms`);
    }
}

function event(stage: TranslationEvent['stage'], message: string): TranslationEvent {
    return { stage, message };
}

function qualityGateDisabledOutcome(unit: TranslationUnit, translated: string): TranslationOutcome {
    return {
        id: unit.id,
        source: unit.source,
        translated,
        assurance: 'unverified',
        reportable: false,
        reason: 'quality_gate_disabled',
        events: [event('mqm', 'MQM quality gate was disabled.')],
    };
}

function initialPassOutcome(
    unit: TranslationUnit,
    translated: string,
    initialEvaluation: MqmResult,
): TranslationOutcome {
    return {
        id: unit.id,
        source: unit.source,
        translated,
        assurance: 'verified',
        reportable: false,
        reason: 'initial_quality_gate_passed',
        initialEvaluation,
        events: [
            event('translation', 'Initial translation received.'),
            event('mqm', 'Initial MQM PASS.'),
        ],
    };
}

function finalOutcome(
    failed: FailedUnit,
    translated: string,
    finalEvaluation: MqmResult,
): TranslationOutcome {
    const passed = finalEvaluation.verdict === 'PASS';
    return {
        id: failed.unit.id,
        source: failed.unit.source,
        translated,
        assurance: passed ? 'verified' : 'unverified',
        reportable: !passed,
        reason: passed ? 'final_quality_gate_passed' : 'final_quality_gate_failed',
        initialTranslation: failed.initialTranslation,
        initialEvaluation: failed.initialEvaluation,
        finalEvaluation,
        events: [
            event('translation', 'Initial translation received.'),
            event('mqm', `Initial MQM ${failed.initialEvaluation.verdict}.`),
            event('postprocess', 'Postprocess translation received.'),
            event('mqm', `Final MQM ${finalEvaluation.verdict}.`),
        ],
    };
}

async function fallbackUnits(
    componentName: string,
    reason: string,
    units: TranslationUnit[],
    translations: Map<string, string>,
    config: TranslationConfig,
    limit: LimitFn,
    log: (message: string) => void,
): Promise<BatchLifecycleResult> {
    log(`batch fallback: ${componentName}: ${reason}`);
    const outcomes = await Promise.all(
        units.map(async (unit) => {
            const translated = translations.get(unit.id);
            if (translated === undefined) {
                throw new Error(`Missing fallback translation id: ${unit.id}`);
            }
            const outcome = await processTranslationLifecycle(unit, translated, config, limit, log);
            return [unit, outcome] as [TranslationUnit, TranslationOutcome];
        }),
    );

    return { outcomes, fallbackReasons: [`${componentName}: ${reason}`] };
}

export async function processComponentBatchLifecycle(
    componentName: string,
    units: TranslationUnit[],
    translations: Map<string, string>,
    config: TranslationConfig,
    limit: LimitFn,
    log: (message: string) => void,
): Promise<BatchLifecycleResult> {
    if (!config.validation.mqm.enabled) {
        return {
            outcomes: units.map((unit) => [
                unit,
                qualityGateDisabledOutcome(unit, translations.get(unit.id) ?? unit.source),
            ]),
            fallbackReasons: [],
        };
    }

    const outcomes: [TranslationUnit, TranslationOutcome][] = [];
    const fallbackReasons: string[] = [];

    const mqmChunks = chunkArray(units, MQM_BATCH_SIZE);
    for (const [chunkIndex, mqmChunk] of mqmChunks.entries()) {
        const chunkLabel =
            mqmChunks.length > 1 ? `${componentName}#${chunkIndex + 1}` : componentName;
        const initialResult = await measureAsync(log, `batchMqm ${chunkLabel}`, () =>
            validateBatchWithMqm(
                componentName,
                mqmChunk,
                translations,
                config,
                log,
                `batchMqm ${chunkLabel}`,
            ),
        );

        if (!initialResult.ok) {
            const fallback = await fallbackUnits(
                componentName,
                `initial batch MQM invalid: ${initialResult.reason}`,
                mqmChunk,
                translations,
                config,
                limit,
                log,
            );
            outcomes.push(...fallback.outcomes);
            fallbackReasons.push(...fallback.fallbackReasons);
            continue;
        }

        const failedUnits: FailedUnit[] = [];
        for (const unit of mqmChunk) {
            const translated = translations.get(unit.id);
            const initialEvaluation = initialResult.evaluations.get(unit.id);
            if (translated === undefined || initialEvaluation === undefined) {
                throw new Error(`Missing batch MQM result for id: ${unit.id}`);
            }
            if (initialEvaluation.verdict === 'PASS') {
                outcomes.push([unit, initialPassOutcome(unit, translated, initialEvaluation)]);
                continue;
            }
            failedUnits.push({ unit, initialTranslation: translated, initialEvaluation });
        }

        for (const [failedChunkIndex, failedChunk] of chunkArray(
            failedUnits,
            POSTPROCESS_BATCH_SIZE,
        ).entries()) {
            const failedChunkLabel = `${componentName}#${chunkIndex + 1}.${failedChunkIndex + 1}`;
            const postprocess = await measureAsync(
                log,
                `batchPostprocess ${failedChunkLabel}`,
                () =>
                    postprocessBatchWithLlm(
                        componentName,
                        failedChunk.map(({ unit, initialTranslation, initialEvaluation }) => ({
                            unit,
                            initialTranslation,
                            errors: initialEvaluation.errors,
                        })),
                        config.llm.postprocessModel,
                        log,
                        `batchPostprocess ${failedChunkLabel}`,
                    ),
            );

            if (!postprocess.ok) {
                const fallback = await fallbackUnits(
                    componentName,
                    `batch postprocess invalid: ${postprocess.reason}`,
                    failedChunk.map(({ unit }) => unit),
                    translations,
                    config,
                    limit,
                    log,
                );
                outcomes.push(...fallback.outcomes);
                fallbackReasons.push(...fallback.fallbackReasons);
                continue;
            }

            const finalResult = await measureAsync(log, `batchFinalMqm ${failedChunkLabel}`, () =>
                validateBatchWithMqm(
                    componentName,
                    failedChunk.map(({ unit }) => unit),
                    postprocess.translations,
                    config,
                    log,
                    `batchFinalMqm ${failedChunkLabel}`,
                ),
            );

            if (!finalResult.ok) {
                const fallback = await fallbackUnits(
                    componentName,
                    `final batch MQM invalid: ${finalResult.reason}`,
                    failedChunk.map(({ unit }) => unit),
                    translations,
                    config,
                    limit,
                    log,
                );
                outcomes.push(...fallback.outcomes);
                fallbackReasons.push(...fallback.fallbackReasons);
                continue;
            }

            for (const failed of failedChunk) {
                const translated = postprocess.translations.get(failed.unit.id);
                const finalEvaluation = finalResult.evaluations.get(failed.unit.id);
                if (translated === undefined || finalEvaluation === undefined) {
                    throw new Error(`Missing final batch MQM result for id: ${failed.unit.id}`);
                }
                outcomes.push([failed.unit, finalOutcome(failed, translated, finalEvaluation)]);
            }
        }
    }

    return { outcomes, fallbackReasons };
}
