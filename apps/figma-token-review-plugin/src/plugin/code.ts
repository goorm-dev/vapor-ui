import type { CodeMsg, SelectionState, UiMsg } from '~/shared/schema';
import { callEvaluator } from './callEvaluator';

figma.showUI(__html__, { width: 450, height: 600 });

function computeSelection(): SelectionState {
    const sel = figma.currentPage.selection;
    if (sel.length === 0) return { kind: 'none' };
    if (sel.length > 1) return { kind: 'multi' };
    const node = sel[0];
    if (node.type !== 'FRAME') return { kind: 'invalid', nodeType: node.type };
    return { kind: 'frame', id: node.id, name: node.name };
}

function emitSelection(): void {
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
            const node = await figma.getNodeByIdAsync(msg.frameId);
            if (!node || node.type !== 'FRAME') {
                figma.ui.postMessage({ type: 'scan-error', message: 'Invalid frame' } satisfies CodeMsg);
                return;
            }
            try {
                const payload = await callEvaluator(msg.frameId);
                figma.ui.postMessage({ type: 'scan-result', payload } satisfies CodeMsg);
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                figma.ui.postMessage({ type: 'scan-error', message } satisfies CodeMsg);
            }
            return;
        }
        case 'focus':
            // Task 8 will implement this
            return;
    }
};
