import type { FinalEntry, TextEntry } from '~/translate/entry-transforms';
import { postprocessWithLlm } from '~/translate/llm-postprocess';
import { validateWithMqm } from '~/translate/mqm-validator';
import type { TranslationConfig } from '~/translate/types';

type LimitFn = <T>(fn: () => Promise<T>) => Promise<T>;

function formatErrorCount(count: number): string {
    return `${count} ${count === 1 ? 'error' : 'errors'}`;
}

export async function processOneEntry(
    entry: TextEntry,
    mtOutput: string | undefined,
    config: TranslationConfig,
    limit: LimitFn,
    label: string,
    log: (message: string) => void,
): Promise<FinalEntry> {
    if (mtOutput === undefined) {
        log(`deepl: missing result for ${label}, using source text`);
        return {
            translated: entry.text,
            initial: { verdict: 'FAIL', errors: [] },
            final: { verdict: 'FAIL', errors: [] },
        };
    }

    // MQM 비활성
    if (!config.validation.mqm.enabled) {
        log(`mqm: disabled for ${label}, using DeepL output`);
        return {
            translated: mtOutput,
            initial: { verdict: 'PASS', errors: [] },
            final: { verdict: 'PASS', errors: [] },
        };
    }

    // MQM 1차 평가
    const mqmResult = await limit(() => validateWithMqm(entry.text, mtOutput, config));
    log(
        `mqm: ${label} ${mqmResult.verdict}${
            mqmResult.verdict === 'FAIL' ? ` (${formatErrorCount(mqmResult.errors.length)})` : ''
        }`,
    );
    if (mqmResult.verdict === 'FAIL') {
        mqmResult.errors.forEach((error, index) => {
            log(`mqm:error ${label} #${index + 1} ${error.severity} ${error.category}`);
            log(`  source_span: ${JSON.stringify(error.source_span)}`);
            log(`  mt_span: ${JSON.stringify(error.mt_span)}`);
            log(`  explanation: ${error.explanation}`);
        });
    }

    if (mqmResult.verdict === 'PASS') {
        return {
            translated: mtOutput,
            ...(mqmResult.degraded ? { llmDegraded: true as const } : {}),
            initial: { verdict: 'PASS', errors: [] },
            final: { verdict: 'PASS', errors: [] },
        };
    }

    // MQM FAIL
    const initialStage = { verdict: 'FAIL' as const, errors: mqmResult.errors };

    if (!config.llm.enabled) {
        log(`llm: disabled for ${label}, keeping failed DeepL output`);
        return {
            translated: mtOutput,
            initial: initialStage,
            final: initialStage,
        };
    }

    // LLM 재번역
    log(`llm: postprocessing ${label}`);
    const postprocess = await limit(() =>
        postprocessWithLlm(entry.text, mtOutput, mqmResult.errors, config.llm.postprocessModel),
    );

    // MQM recheck
    log(`mqm: recheck ${label}`);
    const recheck = await limit(() => validateWithMqm(entry.text, postprocess.translated, config));
    log(
        `mqm: recheck ${label} ${recheck.verdict}${
            recheck.verdict === 'FAIL' ? ` (${formatErrorCount(recheck.errors.length)})` : ''
        }`,
    );
    if (recheck.verdict === 'FAIL') {
        recheck.errors.forEach((error, index) => {
            log(`mqm:error ${label} #${index + 1} ${error.severity} ${error.category}`);
            log(`  source_span: ${JSON.stringify(error.source_span)}`);
            log(`  mt_span: ${JSON.stringify(error.mt_span)}`);
            log(`  explanation: ${error.explanation}`);
        });

        if (config.validation.mqm.failOnError) {
            throw new Error(
                `[mqm-validator] Translation validation FAILED after retry for: "${entry.text.slice(0, 60)}..."`,
            );
        }
    }

    const llmDegraded = postprocess.degraded === true || recheck.degraded === true;
    return {
        translated: postprocess.translated,
        ...(llmDegraded ? { llmDegraded: true as const } : {}),
        initial: initialStage,
        final: { verdict: recheck.verdict, errors: recheck.errors },
    };
}
