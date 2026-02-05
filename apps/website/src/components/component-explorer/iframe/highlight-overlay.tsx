'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { useHighlightReceiver } from './use-highlight-receiver';

interface OverlayRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

// Check if user prefers reduced motion
const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function HighlightOverlay() {
    const { highlightedPart } = useHighlightReceiver();
    const [overlayRect, setOverlayRect] = useState<OverlayRect | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [displayedPart, setDisplayedPart] = useState<string | null>(null);
    const lastRectRef = useRef<OverlayRect>({ top: 0, left: 0, width: 0, height: 0 });

    useEffect(() => {
        if (!highlightedPart) {
            setIsVisible(false);
            return;
        }

        const findAndHighlight = () => {
            const selector = `[data-part="${highlightedPart}"]`;
            const element = document.querySelector(selector);

            // Dialog가 열려있을 때 Trigger 하이라이트 비활성화
            if (highlightedPart === 'Trigger') {
                const dialogPopup = document.querySelector('[data-part="PopupPrimitive"], [data-part="Popup"]');
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
        };

        findAndHighlight();

        // Re-calculate position on scroll/resize
        window.addEventListener('scroll', findAndHighlight, true);
        window.addEventListener('resize', findAndHighlight);

        return () => {
            window.removeEventListener('scroll', findAndHighlight, true);
            window.removeEventListener('resize', findAndHighlight);
        };
    }, [highlightedPart]);

    // Use last known rect when hiding to maintain position during fade out
    const currentRect = overlayRect || lastRectRef.current;

    const padding = 4; // space-100 = 4px
    const transitionDuration = prefersReducedMotion ? '0s' : '0.15s';

    const overlayStyle: CSSProperties = {
        position: 'fixed',
        top: currentRect.top - padding,
        left: currentRect.left - padding,
        width: currentRect.width + padding * 2,
        height: currentRect.height + padding * 2,
        pointerEvents: 'none',
        zIndex: 2147483647,
        borderRadius: '6px',
        // Modern glassmorphism effect
        border: '1.5px solid rgba(59, 130, 246, 0.6)',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        boxShadow: isVisible
            ? '0 0 0 1px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
            : 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.98)',
        transition: `transform ${transitionDuration} ease-out, opacity ${transitionDuration} ease-out, top ${transitionDuration} ease-out, left ${transitionDuration} ease-out, width ${transitionDuration} ease-out, height ${transitionDuration} ease-out, box-shadow ${transitionDuration} ease-out`,
    };

    const labelStyle: CSSProperties = {
        position: 'absolute',
        top: '-28px',
        left: '0',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        letterSpacing: '0.01em',
        color: 'white',
        backgroundColor: 'rgba(59, 130, 246, 0.95)',
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
        backdropFilter: 'blur(4px)',
        transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
        opacity: isVisible ? 1 : 0,
        transition: `transform ${transitionDuration} ease-out, opacity ${transitionDuration} ease-out`,
    };

    return (
        <div style={overlayStyle} role="presentation" aria-hidden="true">
            <span style={labelStyle}>{displayedPart}</span>
        </div>
    );
}
