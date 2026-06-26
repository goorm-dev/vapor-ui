import { useEffect } from 'react';

import { toastManager } from '../components/toast';
import { subscribe } from '../messaging';

export function useFocusToasts() {
    useEffect(
        () =>
            subscribe((msg) => {
                if (msg.type === 'focus-error') {
                    toastManager.add({ title: msg.message, colorPalette: 'danger' });
                    return;
                }
                if (msg.type !== 'focus-result') return;
                if (msg.resolved <= 0 || msg.missing <= 0) return;

                toastManager.add({
                    title: `${msg.missing}개 노드 누락`,
                    colorPalette: 'info',
                });
            }),
        [],
    );
}
