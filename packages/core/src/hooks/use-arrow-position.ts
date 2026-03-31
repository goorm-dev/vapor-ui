import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start';
type Align = 'start' | 'center' | 'end';

export interface ArrowDimensions {
    width: number;
    height: number;
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

export const getArrowSideStyle = (side: Side, arrow: ArrowDimensions): CSSProperties => {
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
        case 'inline-start':
            return { right: horizontal, transform: 'rotate(90deg)' };
        case 'inline-end':
            return { left: horizontal, transform: 'rotate(-90deg)' };
    }
};

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

export const useArrowPosition = ({
    triggerElement,
    positionerElement,
    side,
    align,
    offset = 12,
    arrowDimensions,
}: UseArrowPositionParams): CSSProperties => {
    const [position, setPosition] = useState<CSSProperties>({});

    const sideRef = useRef(side);
    const alignRef = useRef(align);
    const offsetRef = useRef(offset);
    const arrowDimensionsRef = useRef(arrowDimensions);
    sideRef.current = side;
    alignRef.current = align;
    offsetRef.current = offset;
    arrowDimensionsRef.current = arrowDimensions;

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
                arrowDimensionsRef.current,
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
