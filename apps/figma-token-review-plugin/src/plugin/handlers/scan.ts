import { postToUi } from '~/common/messages';
import type { RequestId } from '~/common/messages';

import { on } from '../messages';
import { extractFrame } from './extract';

let activeRequestId: RequestId | null = null;

export function initScan(): void {
    on('scan', async (msg) => {
        if (msg.type !== 'scan') return;

        const { requestId } = msg;
        activeRequestId = requestId;

        try {
            const node = await figma.getNodeByIdAsync(msg.frameId);
            if (activeRequestId !== requestId) return;

            if (!node || node.type !== 'FRAME') {
                postToUi({
                    type: 'extract-error',
                    requestId,
                    message: '선택한 프레임을 찾을 수 없습니다.',
                });
                return;
            }

            const payload = await extractFrame(msg.frameId);
            if (activeRequestId !== requestId) return;

            postToUi({ type: 'extract-result', requestId, payload });
        } catch (err) {
            if (activeRequestId !== requestId) return;

            postToUi({
                type: 'extract-error',
                requestId,
                message: err instanceof Error ? err.message : '알 수 없는 오류',
            });
        }
    });
}
