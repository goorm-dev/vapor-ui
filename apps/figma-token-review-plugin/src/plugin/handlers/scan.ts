import { postToUi } from '~/common/messages';

import { on } from '../messages';
import { extractFrame } from './extract';

let activeRequestId: string | null = null;

export function initScan(): void {
    on('scan', async (msg) => {
        if (msg.type !== 'scan') return;

        const requestId = msg.requestId ?? null;
        activeRequestId = requestId;

        const node = await figma.getNodeByIdAsync(msg.frameId);
        if (activeRequestId !== requestId) return;

        if (!node || node.type !== 'FRAME') {
            postToUi(
                { type: 'extract-error', message: '선택한 프레임을 찾을 수 없습니다.' },
                requestId ?? undefined,
            );
            return;
        }

        try {
            const payload = await extractFrame(msg.frameId);

            if (activeRequestId !== requestId) return;

            postToUi({ type: 'extract-result', payload }, requestId ?? undefined);
        } catch (err) {
            if (activeRequestId !== requestId) return;

            postToUi(
                {
                    type: 'extract-error',
                    message: err instanceof Error ? err.message : '알 수 없는 오류',
                },
                requestId ?? undefined,
            );
        }
    });
}
