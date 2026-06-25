import type { CodeMsg, SelectionState, UiMsg } from '~/shared/schema';

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

figma.ui.onmessage = (msg: UiMsg) => {
    switch (msg.type) {
        case 'request-selection':
            emitSelection();
            return;
        case 'scan':
            // Task 5 will wire this to callEvaluator
            return;
        case 'focus':
            // Task 8 will implement this
            return;
    }
};
