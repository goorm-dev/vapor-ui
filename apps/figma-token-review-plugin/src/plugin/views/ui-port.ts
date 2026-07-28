import { postToUi } from '~/common/messages';
import type { ApiKeyState, RequestId } from '~/common/messages';
import type { LlmContext, RawExtract, SelectionState } from '~/common/schemas';

/** controllers 는 postToUi 직접 호출 불가 — 발송 지점 SSOT. */
export type ExtractPayload = { extract: RawExtract; llmContext: LlmContext };

export function sendExtractResult(requestId: RequestId, payload: ExtractPayload): void {
    postToUi({ type: 'extract-result', requestId, payload });
}

export function sendExtractError(requestId: RequestId, message: string): void {
    postToUi({ type: 'extract-error', requestId, message });
}

export function sendFocusResult(requestId: RequestId, resolved: number, missing: number): void {
    postToUi({ type: 'focus-result', requestId, resolved, missing });
}

export function sendFocusError(requestId: RequestId, message: string): void {
    postToUi({ type: 'focus-error', requestId, message });
}

export function sendSelection(state: SelectionState): void {
    postToUi({ type: 'selection', state });
}

export function sendApiKeyState(state: ApiKeyState): void {
    postToUi({ type: 'api-key:state', state });
}
