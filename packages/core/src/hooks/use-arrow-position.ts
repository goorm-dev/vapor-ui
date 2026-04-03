import type { CSSProperties } from 'react';
import { useCallback, useState } from 'react';

import { useIsoLayoutEffect } from '~/hooks/use-iso-layout-effect';
import { useLatest } from '~/hooks/use-latest';

/**
 * Which side of the anchor element to align the popup against. May automatically change to avoid collisions.
 */
type Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start';
/**
 * How to align the popup relative to the specified side.
 */
type Align = 'start' | 'center' | 'end';

export interface ArrowDimensions {
    /**
     * The width of the arrow (the size of the base of the triangle).
     */
    width: number;
    /**
     * The height of the arrow (the size of the triangle from base to tip).
     */
    height: number;

    /**
     * The distance (in px) the arrow overlaps the positioner edge.
     * Set this to the positioner's border width so the arrow visually
     * covers the border seam. Defaults to 0 (no overlap).
     *
     * @example
     * // 1px border → overlap: 1
     * { width: 20, height: 10, overlap: 1 }
     */
    overlap?: number;
}

interface UseArrowPositionParams {
    triggerElement: Element | null;
    positionerElement: HTMLElement | null;
    side: Side;
    align: Align;
    offset?: number;
    arrowDimensions: ArrowDimensions;
}

const getArrowSideStyle = (side: Side, arrow: ArrowDimensions): CSSProperties => {
    const overlap = arrow.overlap ?? 0;
    const vertical = `${-(arrow.height - overlap)}px`;
    const horizontal = `${-((arrow.width + arrow.height) / 2 - overlap)}px`;

    switch (side) {
        case 'top':
            return { bottom: vertical, transform: 'rotate(180deg)' };
        case 'right':
            return { left: horizontal, transform: 'rotate(-90deg)' };
        case 'bottom':
            return { top: vertical, transform: 'rotate(0deg)' };
        case 'left':
            return { right: horizontal, transform: 'rotate(90deg)' };
        // LTR only: inline-start maps to left, so the arrow is placed on the right side.
        // TODO: Support RTL (inline-start → right)
        case 'inline-start':
            return { right: horizontal, transform: 'rotate(90deg)' };
        // LTR only: inline-end maps to right, so the arrow is placed on the left side.
        // TODO: Support RTL (inline-end → left)
        case 'inline-end':
            return { left: horizontal, transform: 'rotate(-90deg)' };
    }
};

/**
 * Computes the arrow's slide offset along the positioner edge so that it
 * points toward the center of the trigger element.
 *
 * For `top`/`bottom` sides the offset is horizontal (`left` or `right`);
 * for `left`/`right`/`inline-*` sides it is vertical (`top` or `bottom`).
 * The result is clamped to keep the arrow within the positioner bounds,
 * respecting the minimum `offset` padding on each end.
 *
 * @param triggerRect - Bounding rect of the trigger element.
 * @param positionerRect - Bounding rect of the positioner (popup) element.
 * @param side - Which side of the trigger the positioner is placed on.
 * @param align - Alignment of the positioner relative to the trigger (`start` | `end`).
 * @param offset - Minimum distance (px) from the positioner edge to the arrow.
 * @param arrowDimensions - Width and height of the arrow element.
 * @returns CSS position properties (`left`/`right` or `top`/`bottom`) for the arrow.
 */
const computeArrowPosition = (
    triggerRect: DOMRect,
    positionerRect: DOMRect,
    side: Side,
    align: Align,
    offset: number,
    arrowDimensions: ArrowDimensions,
): CSSProperties => {
    const usesHorizontalArrowOffset = side === 'top' || side === 'bottom';
    const arrowSize = usesHorizontalArrowOffset ? arrowDimensions.width : arrowDimensions.height;

    if (usesHorizontalArrowOffset) {
        const arrowLeft = triggerRect.left - positionerRect.left + offset;
        const maxLeft = positionerRect.width - arrowSize - offset;
        const clamped = Math.min(Math.max(arrowLeft, offset), maxLeft);

        if (align === 'start') {
            return { left: Math.round(clamped), right: 'unset' };
        }

        const arrowRight = positionerRect.right - triggerRect.right + offset;
        const maxRight = positionerRect.width - arrowSize - offset;
        const clampedRight = Math.min(Math.max(arrowRight, offset), maxRight);

        return { left: 'unset', right: Math.round(clampedRight) };
    }

    // side === 'left' | 'right' | 'inline-start' | 'inline-end'
    const arrowTop = triggerRect.top - positionerRect.top + offset;
    const maxTop = positionerRect.height - arrowSize - offset;
    const clamped = Math.min(Math.max(arrowTop, offset), maxTop);

    if (align === 'start') {
        return { top: Math.round(clamped), bottom: 'unset' };
    }

    const arrowBottom = positionerRect.bottom - triggerRect.bottom + offset;
    const maxBottom = positionerRect.height - arrowSize - offset;
    const clampedBottom = Math.min(Math.max(arrowBottom, offset), maxBottom);

    return { top: 'unset', bottom: Math.round(clampedBottom) };
};

/**
 * Returns a complete inline style for positioning an arrow element on a popup.
 *
 * Combines two concerns into a single style object:
 * - **Side style** — places the arrow on the correct positioner edge and rotates
 *   it to face outward (via {@link getArrowSideStyle}).
 * - **Slide offset** — shifts the arrow along that edge so it points toward the
 *   trigger element, clamped within positioner bounds (via {@link computeArrowPosition}).
 *
 * Automatically recalculates on `side`, `align`, or `offset` changes (flip) and
 * observes the positioner's `style` attribute for shift-driven repositioning.
 */
export const useArrowPosition = ({
    triggerElement,
    positionerElement,
    side,
    align,
    offset = 12,
    arrowDimensions,
}: UseArrowPositionParams): CSSProperties => {
    const [position, setPosition] = useState<CSSProperties>({});

    const arrowDimensionsRef = useLatest(arrowDimensions);

    const recalculate = useCallback(() => {
        if (!triggerElement || !positionerElement || align === 'center') {
            setPosition(getArrowSideStyle(side, arrowDimensionsRef.current));
            return;
        }

        const triggerRect = triggerElement.getBoundingClientRect();
        const positionerRect = positionerElement.getBoundingClientRect();

        setPosition({
            ...getArrowSideStyle(side, arrowDimensionsRef.current),
            ...computeArrowPosition(
                triggerRect,
                positionerRect,
                side,
                align as Exclude<Align, 'center'>,
                offset,
                arrowDimensionsRef.current,
            ),
        });
    }, [triggerElement, positionerElement, side, align, offset, arrowDimensionsRef]);

    // Recalculate on side/align/offset change (flip)
    useIsoLayoutEffect(() => {
        recalculate();
    }, [recalculate]);

    // Observe positioner style changes (shift)
    useIsoLayoutEffect(() => {
        if (!positionerElement) return;

        const observer = new MutationObserver(recalculate);
        observer.observe(positionerElement, { attributes: true, attributeFilter: ['style'] });

        return () => observer.disconnect();
    }, [positionerElement, recalculate]);

    return position;
};
