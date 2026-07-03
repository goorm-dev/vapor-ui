import { on, postToUi } from '../bus';

export function initFocus(): void {
    on('focus', async (msg) => {
        if (msg.type !== 'focus') return;
        const requestId = msg.requestId;
        const resolved: SceneNode[] = [];
        const missing: string[] = [];

        for (const nodeId of msg.nodeIds) {
            const n = await figma.getNodeByIdAsync(nodeId);

            if (n && n.type !== 'DOCUMENT' && n.type !== 'PAGE' && 'visible' in n) {
                resolved.push(n as SceneNode);
            } else {
                missing.push(nodeId);
            }
        }

        if (resolved.length === 0) {
            postToUi(
                {
                    type: 'focus-error',
                    message: '이 프레임에 해당 노드 없음 — 파일이 다른가요?',
                },
                requestId,
            );
            postToUi(
                {
                    type: 'focus-result',
                    resolved: 0,
                    missing: missing.length,
                },
                requestId,
            );
            return;
        }

        figma.currentPage.selection = resolved;
        figma.viewport.scrollAndZoomIntoView(resolved);

        postToUi(
            {
                type: 'focus-result',
                resolved: resolved.length,
                missing: missing.length,
            },
            requestId,
        );
    });
}
