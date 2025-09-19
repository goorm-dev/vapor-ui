import { useCallback, useEffect } from 'react';

interface UseAutoResizeOptions {
    autoResize?: boolean;
}

export function useAutoResize<T extends HTMLElement = HTMLTextAreaElement>(
    ref: React.RefObject<T>,
    { autoResize = false }: UseAutoResizeOptions = {},
) {
    const adjustHeight = useCallback(() => {
        const element = ref.current;
        if (!element || !autoResize) return;

        // Reset height to auto to get the correct scrollHeight
        element.style.height = 'auto';

        // Set height to scrollHeight to fit content
        element.style.height = `${element.scrollHeight}px`;
    }, [ref, autoResize]);

    useEffect(() => {
        if (autoResize) {
            adjustHeight();
        }
    }, [adjustHeight, autoResize]);

    return adjustHeight;
}
