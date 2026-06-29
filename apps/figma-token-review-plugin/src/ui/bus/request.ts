import type { RequestId } from '~/shared/protocol';
import { newRequestId } from '~/shared/protocol';

import { postToCode } from '../messaging';

let activeFocusId: RequestId | null = null;

export function requestFocus(nodeIds: string[]): void {
    const requestId = newRequestId();
    activeFocusId = requestId;
    postToCode({ type: 'focus', nodeIds, requestId });
}

export function isActiveFocus(requestId: RequestId | undefined): boolean {
    return requestId != null && requestId === activeFocusId;
}
