import { on } from '../messages';
import { computeSelection } from '../models/selection';
import { sendSelection } from '../views/ui-port';

function emit(): void {
    sendSelection(computeSelection());
}

export function initSelection(): void {
    emit();

    // figma.on 은 controllers 에서 1건 허용 — selectionchange 이벤트는
    // plugin API 레벨 이벤트로 messages.ts 를 경유할 수 없다.
    figma.on('selectionchange', emit);

    on('request-selection', () => {
        emit();
    });
}
