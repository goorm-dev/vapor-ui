import type { CodeMsg, SelectionState, UiMsg } from '~/shared/schema';
import { callEvaluator } from './callEvaluator';

figma.showUI(__html__, { width: 450, height: 600 });

let scanToken = 0;

function computeSelection(): SelectionState {
    const sel = figma.currentPage.selection;
    if (sel.length === 0) return { kind: 'none' };
    if (sel.length > 1) return { kind: 'multi' };
    const node = sel[0];
    if (node.type !== 'FRAME') return { kind: 'invalid', nodeType: node.type };
    return { kind: 'frame', id: node.id, name: node.name };
}

function emitSelection(): void {
    scanToken += 1;
    const msg: CodeMsg = { type: 'selection', state: computeSelection() };
    figma.ui.postMessage(msg);
}

emitSelection();
figma.on('selectionchange', emitSelection);

figma.ui.onmessage = async (msg: UiMsg) => {
    switch (msg.type) {
        case 'request-selection':
            emitSelection();
            return;
        case 'scan': {
            scanToken += 1;
            const myToken = scanToken;
            const node = await figma.getNodeByIdAsync(msg.frameId);
            if (myToken !== scanToken) return;
            if (!node || node.type !== 'FRAME') {
                figma.ui.postMessage({
                    type: 'scan-error',
                    message: '선택한 프레임을 찾을 수 없습니다.',
                } satisfies CodeMsg);
                return;
            }
            try {
                const payload = await callEvaluator(msg.frameId);
                if (myToken !== scanToken) return;
                figma.ui.postMessage({ type: 'scan-result', payload } satisfies CodeMsg);
            } catch (err) {
                if (myToken !== scanToken) return;
                figma.ui.postMessage({
                    type: 'scan-error',
                    message: err instanceof Error ? err.message : '알 수 없는 오류',
                } satisfies CodeMsg);
            }
            return;
        }
        case 'focus': {
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
                figma.ui.postMessage({
                    type: 'focus-error',
                    message: '이 프레임에 해당 노드 없음 — 파일이 다른가요?',
                } satisfies CodeMsg);
                figma.ui.postMessage({
                    type: 'focus-result',
                    resolved: 0,
                    missing: missing.length,
                } satisfies CodeMsg);
                return;
            }
            figma.currentPage.selection = resolved;
            figma.viewport.scrollAndZoomIntoView(resolved);
            figma.ui.postMessage({
                type: 'focus-result',
                resolved: resolved.length,
                missing: missing.length,
            } satisfies CodeMsg);
            return;
        }
        default: {
            const _exhaustive: never = msg;
            return _exhaustive;
        }
    }
};
