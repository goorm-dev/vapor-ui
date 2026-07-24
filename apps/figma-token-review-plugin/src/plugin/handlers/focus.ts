import { postToUi } from '~/common/messages';
import type { RequestId } from '~/common/messages';

import { on } from '../messages';

let activeRequestId: RequestId | null = null;

export function initFocus(): void {
    on('focus', async (msg) => {
        if (msg.type !== 'focus') return;
        const { requestId } = msg;
        activeRequestId = requestId;

        const resolved: SceneNode[] = [];
        const missing: string[] = [];

        for (const nodeId of msg.nodeIds) {
            const n = await figma.getNodeByIdAsync(nodeId);
            if (activeRequestId !== requestId) return;

            if (n && n.type !== 'DOCUMENT' && n.type !== 'PAGE' && 'visible' in n) {
                resolved.push(n as SceneNode);
            } else {
                missing.push(nodeId);
            }
        }

        if (resolved.length === 0) {
            postToUi({
                type: 'focus-error',
                requestId,
                message: '이 프레임에 해당 노드 없음 — 파일이 다른가요?',
            });
            postToUi({
                type: 'focus-result',
                requestId,
                resolved: 0,
                missing: missing.length,
            });
            return;
        }

        if (activeRequestId !== requestId) return;

        figma.currentPage.selection = resolved;
        figma.viewport.scrollAndZoomIntoView(resolved);

        postToUi({
            type: 'focus-result',
            requestId,
            resolved: resolved.length,
            missing: missing.length,
        });
    });
}
