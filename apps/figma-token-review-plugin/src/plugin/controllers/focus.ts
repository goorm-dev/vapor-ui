import type { RequestId } from '~/common/messages';

import { on } from '../messages';
import { resolveSceneNodes } from '../models/node-lookup';
import { sendFocusError, sendFocusResult } from '../views/ui-port';
import { focusNodes } from '../views/viewport';

let activeRequestId: RequestId | null = null;

export function initFocus(): void {
    on('focus', async (msg) => {
        if (msg.type !== 'focus') return;

        const { requestId } = msg;
        activeRequestId = requestId;

        const result = await resolveSceneNodes(msg.nodeIds, () => activeRequestId !== requestId);
        if (!result) return;

        const { resolved, missing } = result;

        if (resolved.length === 0) {
            sendFocusError(requestId, '이 프레임에 해당 노드 없음 — 파일이 다른가요?');
            sendFocusResult(requestId, 0, missing.length);
            return;
        }

        if (activeRequestId !== requestId) return;

        focusNodes(resolved);
        sendFocusResult(requestId, resolved.length, missing.length);
    });
}
