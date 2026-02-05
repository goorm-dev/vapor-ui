'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';

import { useHighlightReceiver } from './use-highlight-receiver';

interface OverlayRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const PADDING = 4; // space-100 = 4px

export function HighlightOverlay() {
    const { highlightedPart } = useHighlightReceiver();
    const [overlayRect, setOverlayRect] = useState<OverlayRect | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [displayedPart, setDisplayedPart] = useState<string | null>(null);
    const lastRectRef = useRef<OverlayRect>({ top: 0, left: 0, width: 0, height: 0 });

    const findAndHighlight = useCallback(() => {
        if (!highlightedPart) {
            setIsVisible(false);
            return;
        }

        const selector = `[data-part="${highlightedPart}"]`;
        const element = document.querySelector(selector);

        // Dialog가 열려있을 때 Trigger 하이라이트 비활성화
        if (highlightedPart === 'Trigger') {
            const dialogPopup = document.querySelector(
                '[data-part="PopupPrimitive"], [data-part="Popup"]',
            );
            if (dialogPopup) {
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

    useEffect(() => {
        findAndHighlight();

        if (!highlightedPart) return;

        // Re-calculate position on scroll/resize
        window.addEventListener('scroll', findAndHighlight, true);
        window.addEventListener('resize', findAndHighlight);

        return () => {
            window.removeEventListener('scroll', findAndHighlight, true);
            window.removeEventListener('resize', findAndHighlight);
        };
    }, [highlightedPart, findAndHighlight]);

    // Use last known rect when hiding to maintain position during fade out
    const currentRect = overlayRect || lastRectRef.current;

    return (
        <div
            className={clsx(
                'fixed pointer-events-none rounded-md',
                'border-[1.5px] border-blue-500/60 bg-blue-500/[0.08]',
                'transition-all duration-150 ease-out',
                'motion-reduce:transition-none',
                isVisible
                    ? 'opacity-100 scale-100 shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_4px_12px_rgba(59,130,246,0.15),inset_0_0_0_1px_rgba(255,255,255,0.1)]'
                    : 'opacity-0 scale-[0.98] shadow-none',
                'z-1',
            )}
            style={{
                top: currentRect.top - PADDING,
                left: currentRect.left - PADDING,
                width: currentRect.width + PADDING * 2,
                height: currentRect.height + PADDING * 2,
            }}
            role="presentation"
            aria-hidden="true"
        >
            <span
                className={clsx(
                    'absolute -top-7 left-0',
                    'px-2.5 py-1 text-[11px] font-semibold tracking-[0.01em]',
                    'font-mono text-white',
                    'bg-blue-500/95 rounded-md backdrop-blur-sm',
                    'shadow-[0_2px_8px_rgba(59,130,246,0.3)]',
                    'whitespace-nowrap',
                    'transition-all duration-150 ease-out',
                    'motion-reduce:transition-none',
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1',
                )}
            >
                {displayedPart}
            </span>
        </div>
    );
}
