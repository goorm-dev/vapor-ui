'use client';

import clsx from 'clsx';

import { useHighlightTracking } from './use-highlight-tracking';

const PADDING = 4; // space-100 = 4px
const LABEL_HEIGHT = 28; // -top-7 = 7 * 4px

export function HighlightOverlay() {
    const { overlayRect, isVisible, displayedPart, lastRect } = useHighlightTracking();

    // Use last known rect when hiding to maintain position during fade out
    const currentRect = overlayRect || lastRect;
    const isLabelOverflowing = currentRect.top - PADDING < LABEL_HEIGHT;

    return (
        <div
            className={clsx(
                'fixed pointer-events-none rounded-md',
                'border-[1.5px] border-v-blue-500/60 bg-v-blue-500/[0.08]',
                'transition-all duration-150 ease-out',
                'motion-reduce:transition-none',
                isVisible
                    ? 'opacity-100 scale-100 shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_4px_12px_rgba(59,130,246,0.15),inset_0_0_0_1px_rgba(255,255,255,0.1)]'
                    : 'opacity-0 scale-[0.98] shadow-none',
                'z-10',
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
                    'absolute',
                    isLabelOverflowing ? 'top-1 left-1' : '-top-7 left-0',
                    'px-2.5 py-1 text-[11px] font-semibold tracking-[0.01em]',
                    'font-mono text-v-white',
                    'bg-v-blue-500/95 rounded-md backdrop-blur-sm',
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
