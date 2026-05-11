import pLimit from 'p-limit';

import { type CacheStore, loadCache, makeCacheKey, saveCache } from '~/cache/cache';
import { postprocessWithLlm } from '~/postprocess/postprocess';
import { type ComponentReport, buildComponentReports } from '~/report/report';
import { callLlm } from '~/translation/client';
import { parseLlmJson } from '~/translation/json';
import { translateComponentUnits } from '~/translation/translate';
import type {
    MqmError,
    MqmResult,
    TranslatableDoc,
    TranslationConfig,
    TranslationEvent,
    TranslationOutcome,
    TranslationUnit,
} from '~/types';
import { MQM_EVALUATOR_PROMPT, isMqmError, validateWithMqm } from '~/validation/validator';

const LLM_CONCURRENCY = 10;
const TRANSLATION_BATCH_SIZE = 20;
const MQM_BATCH_SIZE = 10;
const POSTPROCESS_BATCH_SIZE = 10;

type LimitFn = <T>(fn: () => Promise<T>) => Promise<T>;

// ─── Batch MQM ───────────────────────────────────────────────────────────────

const BATCH_MQM_SYSTEM_PROMPT = `${MQM_EVALUATOR_PROMPT}

Batch mode:
You will receive multiple translation units. Evaluate each unit independently.
Respond with EXACTLY this JSON shape and nothing else:
{"evaluations":[{"id":"component.description","verdict":"PASS","errors":[]}]}`;

interface BatchMqmSuccess {
    ok: true;
    evaluations: Map<string, MqmResult>;
}

interface BatchMqmInvalid {
    ok: false;
    reason: string;
}

type BatchMqmResult = BatchMqmSuccess | BatchMqmInvalid;

function invalidMqm(reason: string): BatchMqmInvalid {
    return { ok: false, reason };
}

function validateBatchEvaluations(units: TranslationUnit[], evaluations: unknown): BatchMqmResult {
    if (!Array.isArray(evaluations)) {
        return invalidMqm('MQM batch response must contain evaluations[]');
    }

    const expectedIds = new Set(units.map((unit) => unit.id));
    const seen = new Set<string>();
    const result = new Map<string, MqmResult>();

    for (const item of evaluations) {
        if (typeof item !== 'object' || item === null) {
            return invalidMqm('MQM evaluation item must be a JSON object');
        }
        const record = item as Record<string, unknown>;
        if (typeof record.id !== 'string') return invalidMqm('MQM evaluation id must be a string');
        if (!expectedIds.has(record.id)) return invalidMqm(`Unknown evaluation id: ${record.id}`);
        if (seen.has(record.id)) return invalidMqm(`Duplicate evaluation id: ${record.id}`);
        if (record.verdict !== 'PASS' && record.verdict !== 'FAIL') {
            return invalidMqm(`Invalid MQM verdict for id: ${record.id}`);
        }
        if (!Array.isArray(record.errors) || !record.errors.every(isMqmError)) {
            return invalidMqm(`Invalid MQM errors for id: ${record.id}`);
        }
        seen.add(record.id);
        result.set(record.id, { verdict: record.verdict, errors: record.errors });
    }

    for (const unit of units) {
        if (!seen.has(unit.id)) return invalidMqm(`Missing evaluation id: ${unit.id}`);
    }

    return { ok: true, evaluations: result };
}

async function validateBatchWithMqm(
    componentName: string,
    units: TranslationUnit[],
    translations: Map<string, string>,
    config: TranslationConfig,
): Promise<BatchMqmResult> {
    if (units.length === 0) return { ok: true, evaluations: new Map() };

    const request = {
        componentName,
        units: units.map((unit) => ({
            id: unit.id,
            kind: unit.kind,
            ownerName: unit.ownerName,
            source: unit.source,
            translated: translations.get(unit.id) ?? '',
        })),
    };

    const result = await callLlm(
        [
            { role: 'system', content: BATCH_MQM_SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(request) },
        ],
        { model: config.llm.validationModel ?? 'claude-opus-4-7', responseFormat: 'json' },
    );

    if (!result.content) {
        const statusInfo = result.statusCode !== undefined ? ` (HTTP ${result.statusCode})` : '';
        return invalidMqm(`[batch-mqm] ${result.error ?? 'empty response'}${statusInfo}`);
    }

    try {
        const parsed = parseLlmJson(result.content);
        if (typeof parsed !== 'object' || parsed === null) {
            return invalidMqm('MQM batch response must be a JSON object');
        }
        return validateBatchEvaluations(units, (parsed as Record<string, unknown>).evaluations);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return invalidMqm(`Failed to parse MQM batch response: ${message}`);
    }
}

// ─── Batch Postprocess ───────────────────────────────────────────────────────

const BATCH_POSTPROCESS_SYSTEM_PROMPT = `You are a professional Korean translator and post-editor for a design system documentation site.

You will receive failed translation units with their English source text, initial Korean translation, and MQM error feedback.

Rules:
1. Fix every MQM error listed for each unit.
2. Do not change parts that are not covered by any error unless required for grammar.
3. Never translate or alter PascalCase component names, camelCase prop names, quoted enum values, inline code, token names, URLs, or markdown formatting.
4. Respond ONLY with JSON in this exact shape:
{"translations":[{"id":"component.description","translated":"final Korean text"}]}`;

interface BatchPostprocessInput {
    unit: TranslationUnit;
    initialTranslation: string;
    errors: MqmError[];
}

interface BatchPostprocessSuccess {
    ok: true;
    translations: Map<string, string>;
}

interface BatchPostprocessInvalid {
    ok: false;
    reason: string;
}

type BatchPostprocessResult = BatchPostprocessSuccess | BatchPostprocessInvalid;

function invalidPostprocess(reason: string): BatchPostprocessInvalid {
    return { ok: false, reason };
}

function validateBatchTranslations(
    inputs: BatchPostprocessInput[],
    translations: unknown,
): BatchPostprocessResult {
    if (!Array.isArray(translations)) {
        return invalidPostprocess('Postprocess batch response must contain translations[]');
    }

    const expectedIds = new Set(inputs.map((input) => input.unit.id));
    const seen = new Set<string>();
    const result = new Map<string, string>();

    for (const item of translations) {
        if (typeof item !== 'object' || item === null) {
            return invalidPostprocess('Postprocess translation item must be a JSON object');
        }
        const record = item as Record<string, unknown>;
        if (typeof record.id !== 'string') {
            return invalidPostprocess('Postprocess translation id must be a string');
        }
        if (!expectedIds.has(record.id)) {
            return invalidPostprocess(`Unknown translation id: ${record.id}`);
        }
        if (seen.has(record.id)) {
            return invalidPostprocess(`Duplicate translation id: ${record.id}`);
        }
        if (typeof record.translated !== 'string') {
            return invalidPostprocess(`Translated text must be a string for id: ${record.id}`);
        }
        if (record.translated.trim().length === 0) {
            return invalidPostprocess(`Empty translation for id: ${record.id}`);
        }
        seen.add(record.id);
        result.set(record.id, record.translated);
    }

    for (const input of inputs) {
        if (!seen.has(input.unit.id)) {
            return invalidPostprocess(`Missing translation id: ${input.unit.id}`);
        }
    }

    return { ok: true, translations: result };
}

async function postprocessBatchWithLlm(
    componentName: string,
    inputs: BatchPostprocessInput[],
    model?: string,
): Promise<BatchPostprocessResult> {
    if (inputs.length === 0) return { ok: true, translations: new Map() };

    const request = {
        componentName,
        units: inputs.map(({ unit, initialTranslation, errors }) => ({
            id: unit.id,
            kind: unit.kind,
            ownerName: unit.ownerName,
            source: unit.source,
            initialTranslation,
            errors,
        })),
    };

    const result = await callLlm(
        [
            { role: 'system', content: BATCH_POSTPROCESS_SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(request) },
        ],
        { model, responseFormat: 'json' },
    );

    if (!result.content) {
        const statusInfo = result.statusCode !== undefined ? ` (HTTP ${result.statusCode})` : '';
        return invalidPostprocess(
            `[batch-postprocess] ${result.error ?? 'empty response'}${statusInfo}`,
        );
    }

    try {
        const parsed = parseLlmJson(result.content);
        if (typeof parsed !== 'object' || parsed === null) {
            return invalidPostprocess('Postprocess batch response must be a JSON object');
        }
        return validateBatchTranslations(inputs, (parsed as Record<string, unknown>).translations);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return invalidPostprocess(`Failed to parse postprocess batch response: ${message}`);
    }
}

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
        const translated =
            (outcomes.get(getTranslationUnitKey(unit)) ?? outcomes.get(unit.id))?.translated ??
            unit.source;
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

// ─── Unit Lifecycle (fallback) ────────────────────────────────────────────────

function makeEvent(stage: TranslationEvent['stage'], message: string): TranslationEvent {
    return { stage, message };
}

function hasUnavailable(result: MqmResult): boolean {
    return result.unavailable === true;
}

async function processUnitLifecycle(
    unit: TranslationUnit,
    initialTranslation: string,
    config: TranslationConfig,
    limit: LimitFn,
): Promise<TranslationOutcome> {
    const events: TranslationEvent[] = [makeEvent('translation', 'Initial translation received.')];

    const initialEvaluation = await limit(() =>
        validateWithMqm(unit.source, initialTranslation, config),
    );
    events.push(
        makeEvent(
            'mqm',
            hasUnavailable(initialEvaluation)
                ? 'Initial MQM unavailable.'
                : `Initial MQM ${initialEvaluation.verdict}.`,
        ),
    );

    if (hasUnavailable(initialEvaluation)) {
        return {
            id: unit.id,
            source: unit.source,
            translated: initialTranslation,
            assurance: 'unverified',
            reportable: true,
            reason: 'initial_quality_gate_unavailable',
            initialEvaluation,
            events,
        };
    }

    if (initialEvaluation.verdict === 'PASS') {
        return {
            id: unit.id,
            source: unit.source,
            translated: initialTranslation,
            assurance: 'verified',
            reportable: false,
            reason: 'initial_quality_gate_passed',
            initialEvaluation,
            events,
        };
    }

    const postprocess = await limit(() =>
        postprocessWithLlm(
            unit.source,
            initialTranslation,
            initialEvaluation.errors,
            config.llm.postprocessModel,
        ),
    );
    events.push(
        makeEvent(
            'postprocess',
            postprocess.invalid === true
                ? 'Postprocess response was invalid.'
                : 'Postprocess translation received.',
        ),
    );

    if (postprocess.invalid === true) {
        return {
            id: unit.id,
            source: unit.source,
            translated: initialTranslation,
            assurance: 'unverified',
            reportable: true,
            reason: 'postprocess_response_invalid',
            initialEvaluation,
            events,
        };
    }

    const finalEvaluation = await limit(() =>
        validateWithMqm(unit.source, postprocess.translated, config),
    );
    events.push(
        makeEvent(
            'mqm',
            hasUnavailable(finalEvaluation)
                ? 'Final MQM unavailable.'
                : `Final MQM ${finalEvaluation.verdict}.`,
        ),
    );

    if (hasUnavailable(finalEvaluation)) {
        return {
            id: unit.id,
            source: unit.source,
            translated: postprocess.translated,
            assurance: 'unverified',
            reportable: true,
            reason: 'final_quality_gate_unavailable',
            initialTranslation,
            initialEvaluation,
            finalEvaluation,
            events,
        };
    }

    if (finalEvaluation.verdict === 'PASS') {
        return {
            id: unit.id,
            source: unit.source,
            translated: postprocess.translated,
            assurance: 'verified',
            reportable: false,
            reason: 'final_quality_gate_passed',
            initialTranslation,
            initialEvaluation,
            finalEvaluation,
            events,
        };
    }

    return {
        id: unit.id,
        source: unit.source,
        translated: postprocess.translated,
        assurance: 'unverified',
        reportable: true,
        reason: 'final_quality_gate_failed',
        initialTranslation,
        initialEvaluation,
        finalEvaluation,
        events,
    };
}

// ─── Component Batch Lifecycle ────────────────────────────────────────────────

interface FailedUnit {
    unit: TranslationUnit;
    initialTranslation: string;
    initialEvaluation: MqmResult;
}

interface ComponentLifecycleResult {
    outcomes: [TranslationUnit, TranslationOutcome][];
    fallbackReasons: string[];
}

function chunkArray<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }
    return chunks;
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
            makeEvent('translation', 'Initial translation received.'),
            makeEvent('mqm', 'Initial MQM PASS.'),
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
            makeEvent('translation', 'Initial translation received.'),
            makeEvent('mqm', `Initial MQM ${failed.initialEvaluation.verdict}.`),
            makeEvent('postprocess', 'Postprocess translation received.'),
            makeEvent('mqm', `Final MQM ${finalEvaluation.verdict}.`),
        ],
    };
}

async function fallbackToUnitLifecycle(
    componentName: string,
    reason: string,
    units: TranslationUnit[],
    translations: Map<string, string>,
    config: TranslationConfig,
    limit: LimitFn,
): Promise<ComponentLifecycleResult> {
    const outcomes = await Promise.all(
        units.map(async (unit) => {
            const translated = translations.get(unit.id);
            if (translated === undefined) {
                throw new Error(`Missing fallback translation id: ${unit.id}`);
            }
            const outcome = await processUnitLifecycle(unit, translated, config, limit);
            return [unit, outcome] as [TranslationUnit, TranslationOutcome];
        }),
    );
    return { outcomes, fallbackReasons: [`${componentName}: ${reason}`] };
}

async function processComponentLifecycle(
    componentName: string,
    units: TranslationUnit[],
    translations: Map<string, string>,
    config: TranslationConfig,
    limit: LimitFn,
): Promise<ComponentLifecycleResult> {
    const outcomes: [TranslationUnit, TranslationOutcome][] = [];
    const fallbackReasons: string[] = [];

    const mqmChunks = chunkArray(units, MQM_BATCH_SIZE);
    for (const mqmChunk of mqmChunks) {
        const initialResult = await validateBatchWithMqm(
            componentName,
            mqmChunk,
            translations,
            config,
        );

        if (!initialResult.ok) {
            const fallback = await fallbackToUnitLifecycle(
                componentName,
                `initial batch MQM invalid: ${initialResult.reason}`,
                mqmChunk,
                translations,
                config,
                limit,
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

        for (const failedChunk of chunkArray(failedUnits, POSTPROCESS_BATCH_SIZE)) {
            const postprocess = await postprocessBatchWithLlm(
                componentName,
                failedChunk.map(({ unit, initialTranslation, initialEvaluation }) => ({
                    unit,
                    initialTranslation,
                    errors: initialEvaluation.errors,
                })),
                config.llm.postprocessModel,
            );

            if (!postprocess.ok) {
                const fallback = await fallbackToUnitLifecycle(
                    componentName,
                    `batch postprocess invalid: ${postprocess.reason}`,
                    failedChunk.map(({ unit }) => unit),
                    translations,
                    config,
                    limit,
                );
                outcomes.push(...fallback.outcomes);
                fallbackReasons.push(...fallback.fallbackReasons);
                continue;
            }

            const finalResult = await validateBatchWithMqm(
                componentName,
                failedChunk.map(({ unit }) => unit),
                postprocess.translations,
                config,
            );

            if (!finalResult.ok) {
                const fallback = await fallbackToUnitLifecycle(
                    componentName,
                    `final batch MQM invalid: ${finalResult.reason}`,
                    failedChunk.map(({ unit }) => unit),
                    translations,
                    config,
                    limit,
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
    props: TranslatableDoc[],
    config: TranslationConfig,
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
    const useCache = !config.skipCache;
    let cacheStore: CacheStore = new Map();
    if (useCache && cacheOutputDir) {
        cacheStore = loadCache(cacheOutputDir);
    }

    const outcomes = new Map<string, TranslationOutcome>();
    const validationLimit = pLimit(LLM_CONCURRENCY);
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
            const cacheEntry = useCache
                ? cacheStore.get(makeCacheKey(unit.source, config))
                : undefined;
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
                const translations = await translateComponentUnits(
                    componentName,
                    componentChunk,
                    config,
                );

                const processed = await processComponentLifecycle(
                    componentName,
                    componentChunk,
                    translations,
                    config,
                    validationLimit,
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

        if (useCache && cacheOutputDir) {
            saveCache(cacheOutputDir, cacheStore);
        }
    }

    if (batchFallbacks.length > 0) {
        console.warn(
            `[i18n] batch fallback summary: ${batchFallbacks.length} chunk(s) fell back. ${batchFallbacks
                .map((entry) => `${entry.componentName}: ${entry.reason}`)
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
