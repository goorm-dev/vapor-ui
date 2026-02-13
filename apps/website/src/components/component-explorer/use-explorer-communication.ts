'use client';

import { type RefObject, useCallback, useEffect, useState } from 'react';

import { type AvailablePartsMessage, EXPLORER_MESSAGES, type ExplorerMessage } from './types';

export function useExplorerCommunication(iframeRef: RefObject<HTMLIFrameElement | null>) {
    const [availableParts, setAvailableParts] = useState<string[] | null>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent<ExplorerMessage>) => {
            if (event.origin !== window.location.origin) return;

            const { data } = event;

            if (data.type === EXPLORER_MESSAGES.AVAILABLE_PARTS) {
                const message = data as AvailablePartsMessage;
                // parts 배열이 변경되었을 때만 업데이트 (불필요한 리렌더링 방지)
                setAvailableParts((prev) => {
                    const next = message.payload.parts;
                    if (
                        prev &&
                        prev.length === next.length &&
                        prev.every((p) => next.includes(p))
                    ) {
                        return prev;
                    }
                    return next;
                });
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

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

    return { highlightPart, availableParts };
}
