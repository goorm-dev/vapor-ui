'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useHighlightReceiver } from './use-highlight-receiver';

export interface OverlayRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const ZERO_RECT: OverlayRect = { top: 0, left: 0, width: 0, height: 0 };

export function useHighlightTracking() {
    const { highlightedPart } = useHighlightReceiver();
    const [overlayRect, setOverlayRect] = useState<OverlayRect | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [displayedPart, setDisplayedPart] = useState<string | null>(null);
    const lastRectRef = useRef<OverlayRect>(ZERO_RECT);
    const frameRef = useRef<number | null>(null);

    const findAndHighlight = useCallback(() => {
        if (!highlightedPart) {
            setIsVisible(false);
            return;
        }

        const selector = `[data-part="${CSS.escape(highlightedPart)}"]`;
        const element = document.querySelector(selector);

        // Disable highlight when OverlayPrimitive is covering Trigger (Dialog, Sheet, etc.)
        // Keep Trigger highlight for Menu/Select/Popover since they have no Overlay
        if (highlightedPart === 'Trigger') {
            const overlay = document.querySelector('[data-part="OverlayPrimitive"]');
            if (overlay) {
                setIsVisible(false);
                return;
            }
        }

        if (element) {
            const rect = element.getBoundingClientRect();
            const newRect = {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            };
            lastRectRef.current = newRect;
            setOverlayRect(newRect);
            setDisplayedPart(highlightedPart);
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [highlightedPart]);

    const scheduleFindAndHighlight = useCallback(() => {
        if (frameRef.current !== null) {
            window.cancelAnimationFrame(frameRef.current);
        }

        frameRef.current = window.requestAnimationFrame(() => {
            frameRef.current = null;
            findAndHighlight();
        });
    }, [findAndHighlight]);

    useEffect(() => {
        findAndHighlight();

        if (!highlightedPart) {
            return () => {
                if (frameRef.current !== null) {
                    window.cancelAnimationFrame(frameRef.current);
                    frameRef.current = null;
                }
            };
        }

        const resizeObserver = new ResizeObserver(() => {
            scheduleFindAndHighlight();
        });
        const mutationObserver = new MutationObserver(() => {
            scheduleFindAndHighlight();
        });

        resizeObserver.observe(document.documentElement);

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => {
            if (frameRef.current !== null) {
                window.cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }

            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [highlightedPart, findAndHighlight, scheduleFindAndHighlight]);

    return {
        overlayRect,
        isVisible,
        displayedPart,
        lastRect: lastRectRef.current,
    };
}
