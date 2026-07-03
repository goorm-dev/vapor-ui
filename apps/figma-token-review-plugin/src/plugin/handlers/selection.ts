import { postToUi } from '~/common/messages';
import type { SelectionState } from '~/common/schemas';

import { on } from '../messages';

function computeSelection(): SelectionState {
    const sel = figma.currentPage.selection;

    if (sel.length === 0) return { kind: 'none' };
    if (sel.length > 1) return { kind: 'multi' };

    const node = sel[0];

    if (node.type !== 'FRAME') return { kind: 'invalid', nodeType: node.type };

    return { kind: 'frame', id: node.id, name: node.name };
}

function emit(): void {
    postToUi({ type: 'selection', state: computeSelection() });
}

export function initSelection(): void {
    emit();

    figma.on('selectionchange', emit);

    on('request-selection', () => {
        emit();
    });
}
