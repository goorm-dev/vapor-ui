'use client';

import { type RefObject, useCallback } from 'react';

import { EXPLORER_MESSAGES } from './types';

export function useExplorerCommunication(iframeRef: RefObject<HTMLIFrameElement | null>) {
    const highlightPart = useCallback(
        (partName: string | null) => {
            const iframe = iframeRef.current;
            if (!iframe?.contentWindow) return;

            if (partName) {
                iframe.contentWindow.postMessage(
                    {
                        type: EXPLORER_MESSAGES.HIGHLIGHT_PART,
                        payload: { partName },
                    },
                    window.location.origin,
                );
            } else {
                iframe.contentWindow.postMessage(
                    {
                        type: EXPLORER_MESSAGES.CLEAR_HIGHLIGHT,
                    },
                    window.location.origin,
                );
            }
        },
        [iframeRef],
    );

    return { highlightPart };
}
