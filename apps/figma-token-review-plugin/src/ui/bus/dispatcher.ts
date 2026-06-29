import type { CodeEnvelope } from '~/shared/protocol';

import { toastManager } from '../components/toast';
import { EvaluatorHttpError, EvaluatorParseError, runEvaluation } from '../evaluator';
import { scanActions, scanStore } from '../store/scan';
import { selectionStore } from '../store/selection';
import { onMessage } from './client';
import { isActiveFocus } from './request';

let started = false;
let activeEvaluation: AbortController | null = null;

export function startMessageBridge(): () => void {
    if (started) return () => {};
    started = true;

    const unsub = onMessage(handle);

    return () => {
        unsub();
        started = false;
    };
}

function handle(msg: CodeEnvelope) {
    switch (msg.type) {
        case 'selection':
            selectionStore.setState(msg.state);
            return;
        case 'extract-result':
            void evaluateExtract(msg);
            return;
        case 'extract-error': {
            const applied = scanActions.error(msg.requestId);
            if (!applied) return;
            toastManager.add({ title: msg.message, colorPalette: 'danger' });
            return;
        }
        case 'focus-error':
            if (!isActiveFocus(msg.requestId)) return;
            toastManager.add({ title: msg.message, colorPalette: 'danger' });
            return;
        case 'focus-result':
            if (!isActiveFocus(msg.requestId)) return;
            if (msg.resolved <= 0 || msg.missing <= 0) return;
            toastManager.add({
                title: `${msg.missing}개 노드 누락`,
                colorPalette: 'info',
            });
            return;
    }
}

async function evaluateExtract(
    msg: Extract<CodeEnvelope, { type: 'extract-result' }>,
): Promise<void> {
    const state = scanStore.getState();
    if (state.kind !== 'loading' || state.requestId !== msg.requestId) return;

    activeEvaluation?.abort();
    const controller = new AbortController();
    activeEvaluation = controller;

    try {
        const payload = await runEvaluation(msg.payload, { signal: controller.signal });
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
    if (err instanceof EvaluatorHttpError) {
        if (err.status === 401 || err.status === 403) return 'API 키를 확인하세요.';
        if (err.status === 429) return '요청이 많습니다. 잠시 후 다시 시도해 주세요.';
        return `LLM 호출 실패 (${err.status})`;
    }
    if (err instanceof EvaluatorParseError) return 'LLM 응답 형식 오류';
    if (err instanceof Error) return err.message;
    return '알 수 없는 오류';
}
