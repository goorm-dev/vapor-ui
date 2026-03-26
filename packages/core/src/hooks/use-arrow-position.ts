import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start';
type Align = 'start' | 'center' | 'end';

const ARROW_SIZE = 8;
const MIN_PADDING = 12;

interface UseArrowPositionParams {
    triggerElement: Element | null;
    positionerElement: HTMLElement | null;
    side: Side;
    align: Align;
    offset?: number;
}

const computeArrowPosition = (
    triggerRect: DOMRect,
    positionerRect: DOMRect,
    side: Side,
    align: Align,
    offset: number,
): CSSProperties => {
    const isHorizontalSide = side === 'top' || side === 'bottom';

    if (isHorizontalSide) {
        const arrowLeft = triggerRect.left - positionerRect.left + offset;
        const maxLeft = positionerRect.width - ARROW_SIZE - MIN_PADDING;
        const clamped = Math.min(Math.max(arrowLeft, MIN_PADDING), maxLeft);

        if (align === 'start') {
            return { left: clamped, right: 'unset' };
        }

        const arrowRight = positionerRect.right - triggerRect.right + offset;
        const maxRight = positionerRect.width - ARROW_SIZE - MIN_PADDING;
        const clampedRight = Math.min(Math.max(arrowRight, MIN_PADDING), maxRight);

        return { left: 'unset', right: clampedRight };
    }

    // side === 'left' | 'right'
    const arrowTop = triggerRect.top - positionerRect.top + offset;
    const maxTop = positionerRect.height - ARROW_SIZE - MIN_PADDING;
    const clamped = Math.min(Math.max(arrowTop, MIN_PADDING), maxTop);

    if (align === 'start') {
        return { top: clamped, bottom: 'unset' };
    }

    const arrowBottom = positionerRect.bottom - triggerRect.bottom + offset;
    const maxBottom = positionerRect.height - ARROW_SIZE - MIN_PADDING;
    const clampedBottom = Math.min(Math.max(arrowBottom, MIN_PADDING), maxBottom);

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
    }, [recalculate, side, align]);

    // Observe positioner style changes (shift)
    useEffect(() => {
        if (!positionerElement) return;

        const observer = new MutationObserver(recalculate);
        observer.observe(positionerElement, { attributes: true, attributeFilter: ['style'] });

        return () => observer.disconnect();
    }, [positionerElement, recalculate]);

    return position;
};
