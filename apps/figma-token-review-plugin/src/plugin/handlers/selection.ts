import { postToUi } from '~/common/messages';
import type { SelectionState } from '~/common/schemas';

import { on } from '../messages';

type FrameLike = FrameNode | InstanceNode;

function findFrameAncestor(node: BaseNode): FrameLike | null {
    let cur: BaseNode | null = node;
    while (cur) {
        if (cur.type === 'FRAME' || cur.type === 'INSTANCE') return cur;
        cur = 'parent' in cur ? cur.parent : null;
    }
    return null;
}

function computeSelection(): SelectionState {
    const sel = figma.currentPage.selection;

    if (sel.length === 0) return { kind: 'none' };

    const frames = sel.map((n) => findFrameAncestor(n));

    if (frames.some((f) => f === null)) {
        if (sel.length > 1) return { kind: 'multi' };
        return { kind: 'invalid', nodeType: sel[0].type };
    }

    const uniqueIds = new Set(frames.map((f) => (f as FrameLike).id));
    if (uniqueIds.size > 1) return { kind: 'multi' };

    const frame = frames[0] as FrameLike;
    return { kind: 'frame', id: frame.id, name: frame.name };
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
