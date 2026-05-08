import { postprocessWithLlm } from '~/translate/llm-postprocess';
import { validateWithMqm } from '~/translate/mqm-validator';
import type {
    MqmResult,
    TranslationConfig,
    TranslationEvent,
    TranslationOutcome,
    TranslationUnit,
} from '~/translate/types';

type LimitFn = <T>(fn: () => Promise<T>) => Promise<T>;

function event(stage: TranslationEvent['stage'], message: string): TranslationEvent {
    return { stage, message };
}

function hasUnavailable(result: MqmResult): boolean {
    return result.unavailable === true;
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

export async function processTranslationLifecycle(
    unit: TranslationUnit,
    initialTranslation: string,
    config: TranslationConfig,
    limit: LimitFn,
    log: (message: string) => void,
): Promise<TranslationOutcome> {
    const events: TranslationEvent[] = [event('translation', 'Initial translation received.')];

    if (!config.validation.mqm.enabled) {
        log(`mqm: disabled for ${unit.id}`);
        return qualityGateDisabledOutcome(unit, initialTranslation);
    }

    const initialEvaluation = await limit(() =>
        validateWithMqm(unit.source, initialTranslation, config),
    );
    events.push(
        event(
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
        event(
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
        event(
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
