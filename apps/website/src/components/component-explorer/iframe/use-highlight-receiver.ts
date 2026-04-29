'use client';

import { useEffect, useState } from 'react';

import { EXPLORER_MESSAGES, type HighlightPartMessage } from '../types';

export function useHighlightReceiver() {
    const [highlightedPart, setHighlightedPart] = useState<string | null>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            const { data } = event;
            if (typeof data !== 'object' || data === null || typeof data.type !== 'string') return;

            if (data.type === EXPLORER_MESSAGES.HIGHLIGHT_PART) {
                const message = data as HighlightPartMessage;
                setHighlightedPart(message.payload.partName);
            } else if (data.type === EXPLORER_MESSAGES.CLEAR_HIGHLIGHT) {
                setHighlightedPart(null);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return { highlightedPart };
}
