import { useEffect } from 'react';

import type { CodeMsg } from '~/common/messages';

import { toastManager } from '../../components/toast';
import { apiKeyActions } from '../api-key';
import { scanActions } from '../scan';
import { selectionStore } from '../selection';
import { evaluateExtract } from './evaluate';
import { isActiveFocus } from './focus';

export const useBridge = () => {
    useEffect(() => {
        window.addEventListener('message', handleWindowMessage);

        return () => {
            window.removeEventListener('message', handleWindowMessage);
        };
    }, []);
};

/* ----- utils ----- */

function handleWindowMessage(event: MessageEvent) {
    const msg = event.data?.pluginMessage as CodeMsg | undefined;
    if (!msg || typeof msg.type !== 'string') return;
    handle(msg);
}

function handle(msg: CodeMsg) {
    switch (msg.type) {
        case 'selection':
            selectionStore.setState(msg.state);
            return;
        case 'extract-result':
            void evaluateExtract(msg);
            return;
        case 'extract-error': {
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
        case 'api-key:state':
            apiKeyActions.apply(msg.state);
            return;
    }
}
