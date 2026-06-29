import { newRequestId, postToCode } from '~/common/messages';
import type { RequestId } from '~/common/messages';

let activeFocusId: RequestId | null = null;

export function requestFocus(nodeIds: string[]): void {
    const requestId = newRequestId();
    activeFocusId = requestId;
    postToCode({ type: 'focus', nodeIds, requestId });
}

export function isActiveFocus(requestId: RequestId | undefined): boolean {
    return requestId != null && requestId === activeFocusId;
}
