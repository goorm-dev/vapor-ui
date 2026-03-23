'use client';

import { useEffect } from 'react';

import { throttle } from 'lodash-es';

import { EXPLORER_MESSAGES } from '../types';

interface UseAvailablePartsReporterOptions {
    enabled?: boolean;
}

export function useAvailablePartsReporter({
    enabled = true,
}: UseAvailablePartsReporterOptions = {}) {
    useEffect(() => {
        if (!enabled) return;

        const scanAndNotify = throttle(() => {
            const elements = document.querySelectorAll('[data-part]');
            const parts = Array.from(elements)
                .map((element) => element.getAttribute('data-part'))
                .filter((part): part is string => Boolean(part));
            const uniqueParts = Array.from(new Set(parts));

            window.parent.postMessage(
                {
                    type: EXPLORER_MESSAGES.AVAILABLE_PARTS,
                    payload: { parts: uniqueParts },
                },
                window.location.origin,
            );
        }, 500);

        const observer = new MutationObserver(scanAndNotify);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-part'],
        });

        scanAndNotify();

        return () => {
            observer.disconnect();
            scanAndNotify.cancel();
        };
    }, [enabled]);
}
