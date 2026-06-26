import { useEffect, useState } from 'react';

import type { SelectionState } from '~/shared/schema';

import { postToCode, subscribe } from '../messaging';

export function useSelection(): SelectionState {
    const [selection, setSelection] = useState<SelectionState>({ kind: 'none' });

    useEffect(() => {
        const unsubscribe = subscribe((msg) => {
            if (msg.type !== 'selection') return;
            setSelection(msg.state);
        });

        postToCode({ type: 'request-selection' });

        return unsubscribe;
    }, []);

    return selection;
}
