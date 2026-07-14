'use client';

import { useEffect, useRef, useState } from 'react';

import { useStableCallback } from '@base-ui/utils/useStableCallback';

type Side = 'top' | 'right' | 'bottom' | 'left';

type Bounds = { min: number; max: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Only px-resolved values participate in JS clamping; anything else (none, %, keywords)
// is treated as unbounded — the element's own CSS min/max still caps the rendered size.
const parsePx = (value: string): number | null => {
    const match = /^(-?\d+(?:\.\d+)?)px$/.exec(value);
    return match ? parseFloat(match[1]) : null;
};

/**
 * Resize logic for a panel attached to a viewport edge (sheet, drawer, side panel).
 *
 * The panel's CSS owns the size policy: bounds are read from the target's computed
 * min/max-width|height at the start of every interaction (browsers resolve viewport
 * units to px there), then fed to a plain JS clamp — so no write→measure→rollback
 * loop is needed. Pointer moves write the target's style directly (no re-render);
 * React state (`size`, `bounds`) is committed on discrete events only, for
 * aria-valuenow/valuemin/valuemax.
 */
export interface UseResizeHandleOptions {
    /** Element being resized. */
    targetRef: React.RefObject<HTMLElement | null>;
    /** Viewport edge the target is attached to — determines axis and grow direction. */
    side: Side;
    /** px per arrow-key press or step call. */
    step: number;
    disabled?: boolean;
}

export function useResizeHandle(options: UseResizeHandleOptions) {
    const { targetRef, side, step, disabled } = options;

    const axis: 'x' | 'y' = side === 'top' || side === 'bottom' ? 'y' : 'x';
    const dimension = axis === 'x' ? 'width' : 'height';

    // Sign of pointer delta that grows the target. A right/bottom sheet grows when the
    // pointer moves toward the viewport center (negative delta), so its sign is inverted.
    const growSign = side === 'right' || side === 'bottom' ? -1 : 1;

    const [size, setSize] = useState(0);
    const [bounds, setBounds] = useState<Bounds>({ min: 0, max: Infinity });

    /** Real rendered size when available; falls back to state (e.g. jsdom, pre-layout). */
    const readSize = useStableCallback(() => {
        const el = targetRef.current;
        const measured = el ? (axis === 'x' ? el.offsetWidth : el.offsetHeight) : 0;
        return measured || size;
    });

    /**
     * Reads the target's CSS bounds, resolved to px. Called at the start of every
     * interaction so later CSS/viewport changes are picked up without observers.
     */
    const resolveBounds = useStableCallback((): Bounds => {
        const el = targetRef.current;
        if (!el) return { min: 0, max: Infinity };
        const computed = getComputedStyle(el);
        const min = parsePx(axis === 'x' ? computed.minWidth : computed.minHeight) ?? 0;
        const max = parsePx(axis === 'x' ? computed.maxWidth : computed.maxHeight) ?? Infinity;
        const next = { min, max: Math.max(min, max) };
        setBounds((prev) => (prev.min === next.min && prev.max === next.max ? prev : next));
        return next;
    });

    /** Clamps and writes the size to the DOM without re-rendering. */
    const applySize = useStableCallback((next: number, { min, max }: Bounds) => {
        const clamped = clamp(next, min, max);
        const el = targetRef.current;
        if (el) el.style[dimension] = `${clamped}px`;
        return clamped;
    });

    /** Applies a size and commits it to React state (aria-valuenow). */
    const resizeTo = useStableCallback((next: number) => {
        setSize(applySize(next, resolveBounds()));
    });

    const resizeBy = useStableCallback((delta: number) => resizeTo(readSize() + delta));

    // Seed aria values from reality once the target is in the DOM. A passive effect, not
    // a layout effect: targetRef points at an ancestor of the handle, and ancestor refs
    // attach after descendant layout effects — only passive effects see the ref filled.
    // The rendered size is already inside the CSS bounds (the browser enforces them).
    useEffect(() => {
        resolveBounds();
        setSize(readSize());
    }, [resolveBounds, readSize]);

    // Cleanup for an in-progress drag, so pointerup, pointercancel, and unmount share one path.
    const cleanupRef = useRef<(() => void) | null>(null);

    const onPointerDown = useStableCallback((event: React.PointerEvent<HTMLElement>) => {
        if (disabled || event.defaultPrevented || event.button !== 0) return;

        const pointerId = event.pointerId;
        const startCoord = axis === 'x' ? event.clientX : event.clientY;
        const startSize = readSize();
        // One resolve per drag: bounds stay fixed while the pointer is down.
        const dragBounds = resolveBounds();

        event.currentTarget.setPointerCapture?.(pointerId);
        // Prevent text selection / native drag; focus doesn't happen after preventDefault.
        event.preventDefault();
        (event.currentTarget as HTMLElement).focus({ preventScroll: true });

        const handleMove = (moveEvent: PointerEvent) => {
            // Ignore other pointers (multi-touch) so only this drag drives the size.
            if (moveEvent.pointerId !== pointerId) return;
            const coord = axis === 'x' ? moveEvent.clientX : moveEvent.clientY;
            const delta = coord - startCoord;
            applySize(startSize + delta * growSign, dragBounds);
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
            // Commit the measured size, not the last proposal — robust even when CSS
            // outside the resolved bounds (e.g. an unresolvable %) capped the write.
            setSize(readSize());
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
            const { min, max } = resolveBounds();
            // End has no target when the max never resolved to px (unbounded).
            if (event.key === 'End' && !Number.isFinite(max)) return;
            event.preventDefault();
            resizeTo(event.key === 'Home' ? min : max);
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
        /** CSS bounds resolved at the last interaction (px). `max` is Infinity when unresolved. */
        bounds,
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
