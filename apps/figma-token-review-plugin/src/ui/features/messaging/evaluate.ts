import type { CodeEnvelope } from '~/common/messages';

import { toastManager } from '../../components/toast';
import { LlmHttpError, LlmParseError, runLlmEvaluation } from '../llm';
import { scanActions, scanStore } from '../scan';

let activeEvaluation: AbortController | null = null;

export async function evaluateExtract(
    msg: Extract<CodeEnvelope, { type: 'extract-result' }>,
): Promise<void> {
    const state = scanStore.getState();
    if (state.kind !== 'loading' || state.requestId !== msg.requestId) return;

    activeEvaluation?.abort();
    const controller = new AbortController();
    activeEvaluation = controller;

    try {
        const payload = await runLlmEvaluation(msg.payload.extract, msg.payload.llmContext, {
            signal: controller.signal,
        });
        if (activeEvaluation !== controller) return;
        scanActions.result(payload, msg.requestId);
    } catch (err) {
        if (activeEvaluation !== controller) return;
        if (controller.signal.aborted) return;

        const applied = scanActions.error(msg.requestId);
        if (!applied) return;

        toastManager.add({
            title: messageFromEvaluatorError(err),
            colorPalette: 'danger',
        });
    } finally {
        if (activeEvaluation === controller) activeEvaluation = null;
    }
}

function messageFromEvaluatorError(err: unknown): string {
    if (err instanceof LlmHttpError) {
        if (err.status === 401 || err.status === 403) return 'API 키를 확인하세요.';
        if (err.status === 429) return '요청이 많습니다. 잠시 후 다시 시도해 주세요.';
        return `LLM 호출 실패 (${err.status})`;
    }
    if (err instanceof LlmParseError) return 'LLM 응답 형식 오류';
    if (err instanceof Error) return err.message;
    return '알 수 없는 오류';
}
