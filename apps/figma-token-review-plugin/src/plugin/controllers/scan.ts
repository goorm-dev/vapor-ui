import type { RequestId } from '~/common/messages';

import { on } from '../messages';
import { extractFrame } from '../models/extract';
import { getScanTarget } from '../models/node-lookup';
import { sendExtractError, sendExtractResult } from '../views/ui-port';

let activeRequestId: RequestId | null = null;

export function initScan(): void {
    on('scan', async (msg) => {
        if (msg.type !== 'scan') return;

        const { requestId } = msg;
        activeRequestId = requestId;

        try {
            const target = await getScanTarget(msg.frameId);
            if (activeRequestId !== requestId) return;

            if (!target) {
                sendExtractError(requestId, '선택한 프레임 또는 인스턴스를 찾을 수 없습니다.');
                return;
            }

            const payload = await extractFrame(msg.frameId);
            if (activeRequestId !== requestId) return;

            sendExtractResult(requestId, payload);
        } catch (err) {
            if (activeRequestId !== requestId) return;

            sendExtractError(requestId, err instanceof Error ? err.message : '알 수 없는 오류');
        }
    });
}
