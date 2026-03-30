import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start';
type Align = 'start' | 'center' | 'end';

const ARROW_SIZE = 8;
const BLOCK_AXIS_OFFSET = '-11px';
const INLINE_AXIS_OFFSET = '-7px';

interface UseArrowPositionParams {
    triggerElement: Element | null;
    positionerElement: HTMLElement | null;
    side: Side;
    align: Align;
    offset?: number;
}

export const getArrowSideStyle = (side: Side): CSSProperties => {
    switch (side) {
        case 'top':
            return { bottom: BLOCK_AXIS_OFFSET, transform: 'rotate(-90deg)' };
        case 'right':
            return { left: INLINE_AXIS_OFFSET, transform: 'rotate(0deg)' };
        case 'bottom':
            return { top: BLOCK_AXIS_OFFSET, transform: 'rotate(90deg)' };
        case 'left':
            return { right: INLINE_AXIS_OFFSET, transform: 'rotate(180deg)' };
        case 'inline-start':
            return { right: INLINE_AXIS_OFFSET, transform: 'rotate(180deg)' };
        case 'inline-end':
            return { left: INLINE_AXIS_OFFSET, transform: 'rotate(0deg)' };
    }
};

const computeArrowPosition = (
    triggerRect: DOMRect,
    positionerRect: DOMRect,
    side: Side,
    align: Align,
    offset: number,
): CSSProperties => {
    // Logical inline sides sit beside the trigger like left/right.
    const usesHorizontalArrowOffset = side === 'top' || side === 'bottom';

    if (usesHorizontalArrowOffset) {
        const arrowLeft = triggerRect.left - positionerRect.left + offset;
        const maxLeft = positionerRect.width - ARROW_SIZE - offset;
        const clamped = Math.min(Math.max(arrowLeft, offset), maxLeft);

        if (align === 'start') {
            return { left: clamped, right: 'unset' };
        }

        const arrowRight = positionerRect.right - triggerRect.right + offset;
        const maxRight = positionerRect.width - ARROW_SIZE - offset;
        const clampedRight = Math.min(Math.max(arrowRight, offset), maxRight);

        return { left: 'unset', right: clampedRight };
    }

    // side === 'left' | 'right' | 'inline-start' | 'inline-end'
    const arrowTop = triggerRect.top - positionerRect.top + offset;
    const maxTop = positionerRect.height - ARROW_SIZE - offset;
    const clamped = Math.min(Math.max(arrowTop, offset), maxTop);

    if (align === 'start') {
        return { top: clamped, bottom: 'unset' };
    }

    const arrowBottom = positionerRect.bottom - triggerRect.bottom + offset;
    const maxBottom = positionerRect.height - ARROW_SIZE - offset;
    const clampedBottom = Math.min(Math.max(arrowBottom, offset), maxBottom);

    return { top: 'unset', bottom: clampedBottom };
};

export const useArrowPosition = ({
    triggerElement,
    positionerElement,
    side,
    align,
    offset = 12,
}: UseArrowPositionParams): CSSProperties => {
    const [position, setPosition] = useState<CSSProperties>({});

    const sideRef = useRef(side);
    const alignRef = useRef(align);
    const offsetRef = useRef(offset);
    sideRef.current = side;
    alignRef.current = align;
    offsetRef.current = offset;

    const recalculate = useCallback(() => {
        if (!triggerElement || !positionerElement || alignRef.current === 'center') {
            setPosition({});
            return;
        }

        const triggerRect = triggerElement.getBoundingClientRect();
        const positionerRect = positionerElement.getBoundingClientRect();

        setPosition(
            computeArrowPosition(
                triggerRect,
                positionerRect,
                sideRef.current,
                alignRef.current as Exclude<Align, 'center'>,
                offsetRef.current,
            ),
        );
    }, [triggerElement, positionerElement]);

    // Recalculate on side/align change (flip)
    useEffect(() => {
        recalculate();
    }, [recalculate, side, align, offset]);

    // Observe positioner style changes (shift)
    useEffect(() => {
        if (!positionerElement) return;

        const observer = new MutationObserver(recalculate);
        observer.observe(positionerElement, { attributes: true, attributeFilter: ['style'] });

        return () => observer.disconnect();
    }, [positionerElement, recalculate]);

    return position;
};
