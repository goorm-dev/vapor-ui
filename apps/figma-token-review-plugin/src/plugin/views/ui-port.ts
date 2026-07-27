import { postToUi } from '~/common/messages';
import type { ApiKeyState, RequestId } from '~/common/messages';
import type { LlmContext, RawExtract, SelectionState } from '~/common/schemas';

/**
 * plugin → UI 통신 전담 view.
 * controllers 는 postToUi 를 직접 호출하지 않고 반드시 이 모듈을 경유한다 —
 * 메시지 타입과 발송 지점을 한 파일에서 추적 가능하게 유지하기 위함.
 */

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
