import type { CodeEnvelope } from '~/shared/protocol';

import { toastManager } from '../components/toast';
import { scanActions } from '../store/scan';
import { selectionStore } from '../store/selection';
import { onMessage } from './client';
import { isActiveFocus } from './request';

let started = false;

export function startMessageBridge(): () => void {
    if (started) return () => {};
    started = true;

    const unsub = onMessage(handle);

    return () => {
        unsub();
        started = false;
    };
}

function handle(msg: CodeEnvelope) {
    switch (msg.type) {
        case 'selection':
            selectionStore.setState(msg.state);
            return;
        case 'scan-result':
            scanActions.result(msg.payload, msg.requestId);
            return;
        case 'scan-error': {
            const applied = scanActions.error(msg.requestId);
            if (!applied) return;

            toastManager.add({ title: msg.message, colorPalette: 'danger' });
            return;
        }
        case 'focus-error':
            if (!isActiveFocus(msg.requestId)) return;

            toastManager.add({ title: msg.message, colorPalette: 'danger' });

            return;
        case 'focus-result':
            if (!isActiveFocus(msg.requestId)) return;
            if (msg.resolved <= 0 || msg.missing <= 0) return;

            toastManager.add({
                title: `${msg.missing}개 노드 누락`,
                colorPalette: 'info',
            });

            return;
    }
}
