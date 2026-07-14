'use client';

import { useEffect, useRef, useState } from 'react';

import { useStableCallback } from '@base-ui/utils/useStableCallback';

import { useIsoLayoutEffect } from './use-iso-layout-effect';

type Side = 'top' | 'right' | 'bottom' | 'left';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Resize logic for a panel attached to a viewport edge (sheet, drawer, side panel).
 *
 * Owns the shared math — which axis to resize, which pointer/key direction grows the
 * panel — plus 1:1 pointer tracking and keyboard resizing. Pointer moves write the
 * target's style directly (no re-render); React state (`size`) is committed on
 * discrete events only, for aria-valuenow and bound checks.
 */
export interface UseResizeHandleOptions {
    /** Element being resized. */
    targetRef: React.RefObject<HTMLElement | null>;
    /** Viewport edge the target is attached to — determines axis and grow direction. */
    side: Side;
    /** Minimum size (px). */
    minSize: number;
    /** Maximum size (px). */
    maxSize: number;
    /** Assumed size before the first DOM measurement. */
    initialSize: number;
    /** px per arrow-key press or step call. */
    step: number;
    disabled?: boolean;
}

export function useResizeHandle(options: UseResizeHandleOptions) {
    const { targetRef, side, minSize, maxSize, initialSize, step, disabled } = options;

    const axis: 'x' | 'y' = side === 'top' || side === 'bottom' ? 'y' : 'x';
    const dimension = axis === 'x' ? 'width' : 'height';

    // Sign of pointer delta that grows the target. A right/bottom sheet grows when the
    // pointer moves toward the viewport center (negative delta), so its sign is inverted.
    const growSign = side === 'right' || side === 'bottom' ? -1 : 1;

    const [size, setSize] = useState(() => clamp(initialSize, minSize, maxSize));

    // Real rendered size when available; falls back to state (e.g. jsdom, pre-layout).
    const readSize = useStableCallback(() => {
        const el = targetRef.current;
        const measured = el ? (axis === 'x' ? el.offsetWidth : el.offsetHeight) : 0;
        return measured || size;
    });

    /** Clamps and writes the size to the DOM without re-rendering. */
    const applySize = useStableCallback((next: number) => {
        const clamped = clamp(next, minSize, maxSize);
        const el = targetRef.current;
        if (el) el.style[dimension] = `${clamped}px`;
        return clamped;
    });

    /** Applies a size and commits it to React state (aria-valuenow, bound checks). */
    const resizeTo = useStableCallback((next: number) => setSize(applySize(next)));

    const resizeBy = useStableCallback((delta: number) => resizeTo(readSize() + delta));

    // Re-clamp the current size when the bounds change, keeping DOM, state, and aria in range.
    // The useState initializer only clamps on mount; this covers later minSize/maxSize changes.
    useIsoLayoutEffect(() => {
        resizeTo(readSize());
    }, [minSize, maxSize, resizeTo, readSize]);

    // Cleanup for an in-progress drag, so pointerup, pointercancel, and unmount share one path.
    const cleanupRef = useRef<(() => void) | null>(null);

    const onPointerDown = useStableCallback((event: React.PointerEvent<HTMLElement>) => {
        if (disabled || event.defaultPrevented || event.button !== 0) return;

        const pointerId = event.pointerId;
        const startCoord = axis === 'x' ? event.clientX : event.clientY;
        const startSize = readSize();
        let lastSize = startSize;

        event.currentTarget.setPointerCapture?.(pointerId);
        // Prevent text selection / native drag; focus doesn't happen after preventDefault.
        event.preventDefault();
        (event.currentTarget as HTMLElement).focus({ preventScroll: true });

        const handleMove = (moveEvent: PointerEvent) => {
            // Ignore other pointers (multi-touch) so only this drag drives the size.
            if (moveEvent.pointerId !== pointerId) return;
            const coord = axis === 'x' ? moveEvent.clientX : moveEvent.clientY;
            const delta = coord - startCoord;
            lastSize = applySize(startSize + delta * growSign);
        };

        const cleanup = () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleEnd);
            window.removeEventListener('pointercancel', handleEnd);
            cleanupRef.current = null;
        };

        // pointercancel (gesture stolen by the browser) ends the drag just like pointerup;
        // without it the move listener would leak and keep resizing after the pointer is gone.
        const handleEnd = (endEvent: PointerEvent) => {
            if (endEvent.pointerId !== pointerId) return;
            cleanup();
            setSize(lastSize);
        };

        cleanupRef.current = cleanup;
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleEnd);
        window.addEventListener('pointercancel', handleEnd);
    });

    // Tear down a drag that's still active when the component unmounts (e.g. sheet closed mid-drag).
    useEffect(() => () => cleanupRef.current?.(), []);

    const onKeyDown = useStableCallback((event: React.KeyboardEvent<HTMLElement>) => {
        if (disabled || event.defaultPrevented) return;

        if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            resizeTo(event.key === 'Home' ? minSize : maxSize);
            return;
        }

        // Arrow keys move the boundary in screen direction: left/up is negative screen
        // delta, so it grows a right/bottom panel and shrinks a left/top one.
        const screenDelta =
            event.key === 'ArrowLeft' || event.key === 'ArrowUp'
                ? -1
                : event.key === 'ArrowRight' || event.key === 'ArrowDown'
                  ? 1
                  : 0;
        if (screenDelta === 0) return;

        // Ignore cross-axis arrows (e.g. ArrowUp on a vertical splitter).
        const isXKey = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
        if ((axis === 'x') !== isXKey) return;

        event.preventDefault();
        resizeBy(screenDelta * growSign * step);
    });

    return {
        /** Last committed size (px). Stale only while a drag is in progress. */
        size,
        // aria-orientation for role="slider" is the axis the *value* changes along, not
        // the handle's visual direction. A left/right sheet resizes along x → horizontal,
        // so VoiceOver maps Left/Right arrows to value changes (its vertical-slider default
        // is Up/Down, which VO otherwise steals for cursor movement).
        orientation: axis === 'x' ? ('horizontal' as const) : ('vertical' as const),
        /** The dimension being resized ('width' | 'height'), for labelling. */
        dimension,
        resizeBy,
        resizeTo,
        handleProps: { onPointerDown, onKeyDown },
    };
}
