'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useMutationObserverRef } from './use-mutation-observer-ref';

export type ArrowPositionSide = 'top' | 'right' | 'bottom' | 'left' | 'inline-start' | 'inline-end';
export type ArrowPositionAlign = 'start' | 'center' | 'end';
export type ArrowOffset = number | ((side: ArrowPositionSide | undefined) => number);

interface UseArrowPositionOptions {
    /**
     * Distance in pixels between the arrow and the aligned edge of the popup.
     *
     * @default 12
     */
    offset?: ArrowOffset;
    /**
     * Initial `side` used before the popup element mounts and its `data-side` attribute can be read.
     *
     * @default top
     */
    initialSide?: ArrowPositionSide;
    /**
     * Initial `align` used before the popup element mounts and its `data-align` attribute can be read.
     *
     * @default center
     */
    initialAlign?: ArrowPositionAlign;
}

const DATA_SIDE = 'data-side';
const DATA_ALIGN = 'data-align';

export function useArrowPosition<
    Popup extends HTMLElement = HTMLElement,
    Arrow extends HTMLElement = Popup,
>(options: UseArrowPositionOptions = {}) {
    const { offset = 12, initialSide, initialAlign } = options;

    const [side, setSide] = useState<ArrowPositionSide | undefined>(initialSide);
    const [align, setAlign] = useState<ArrowPositionAlign | undefined>(initialAlign);

    const popupRef = useRef<Popup | null>(null);

    useEffect(() => {
        const node = popupRef.current;
        if (!node) return;

        const { side: nextSide, align: nextAlign } = extractPositions(node.dataset);

        if (nextSide) setSide(nextSide);
        if (nextAlign) setAlign(nextAlign);
    }, []);

    const arrowRef = useMutationObserverRef<Arrow>({
        callback: (mutations) => {
            mutations.forEach((mutation) => {
                const { attributeName, target } = mutation;
                const dataset = (target as HTMLElement).dataset;
                const { side: nextSide, align: nextAlign } = extractPositions(dataset);

                if (attributeName === DATA_SIDE && nextSide) setSide(nextSide);
                if (attributeName === DATA_ALIGN && nextAlign) setAlign(nextAlign);
            });
        },
        options: { attributes: true, attributeFilter: [DATA_SIDE, DATA_ALIGN] },
    });

    const position = useMemo(() => {
        const resolvedOffset = typeof offset === 'function' ? offset(side) : offset;

        return getArrowPosition({ side, align, offset: resolvedOffset });
    }, [side, align, offset]);

    return { popupRef, arrowRef, position };
}

const extractPositions = (dataset: DOMStringMap) => ({
    side: dataset.side as ArrowPositionSide | undefined,
    align: dataset.align as ArrowPositionAlign | undefined,
});

interface GetArrowPositionArgs {
    side?: ArrowPositionSide;
    align?: ArrowPositionAlign;
    offset?: number;
}

const getArrowPosition = ({
    side = 'bottom',
    align = 'center',
    offset = 12,
}: GetArrowPositionArgs): CSSProperties => {
    const positionMap = {
        'top-start': { left: offset, right: 'unset' },
        'top-end': { left: 'unset', right: offset },
        'bottom-start': { left: offset, right: 'unset' },
        'bottom-end': { left: 'unset', right: offset },
        'left-start': { top: offset, bottom: 'unset' },
        'left-end': { top: 'unset', bottom: offset },
        'right-start': { top: offset, bottom: 'unset' },
        'right-end': { top: 'unset', bottom: offset },
    } as const;

    const key = `${side}-${align}` as keyof typeof positionMap;
    return positionMap[key] ?? {};
};
