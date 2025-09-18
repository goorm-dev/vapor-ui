import { useCallback, useMemo } from 'react';

interface UseAutoResizeOptions {
    autoResize?: boolean;
    minHeight: number | string;
    maxHeight: number | string;
}

export function useAutoResize(
    textareaRef: React.RefObject<HTMLTextAreaElement>,
    { autoResize, minHeight, maxHeight }: UseAutoResizeOptions,
) {
    const performResize = useCallback(() => {
        if (!autoResize || !textareaRef?.current) return;

        const textarea = textareaRef.current;
        const maxHeightPx = typeof maxHeight === 'number' ? maxHeight : parseFloat(maxHeight);
        const minHeightPx = typeof minHeight === 'number' ? minHeight : parseFloat(minHeight);

        // Reset to get accurate measurement
        textarea.style.overflowY = 'hidden';
        textarea.style.height = 'auto';

        const scrollHeight = textarea.scrollHeight;

        if (scrollHeight > maxHeightPx) {
            textarea.style.height = `${maxHeightPx}px`;
            textarea.style.overflowY = 'scroll';
        } else {
            const newHeight = Math.max(scrollHeight, minHeightPx);
            textarea.style.height = `${newHeight}px`;
            textarea.style.overflowY = 'hidden';
        }
    }, [autoResize, maxHeight, minHeight, textareaRef]);

    const autoResizeTextarea = useMemo(() => {
        return () => requestAnimationFrame(performResize);
    }, [performResize]);

    return autoResizeTextarea;
}