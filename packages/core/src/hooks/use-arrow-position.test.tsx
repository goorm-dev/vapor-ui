import { useEffect, useRef, useState } from 'react';

import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ArrowDimensions } from './use-arrow-position';
import { getArrowSideStyle, useArrowPosition } from './use-arrow-position';

type TestSide = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
type TestAlign = 'start' | 'center' | 'end';

const createRect = ({
    left,
    top,
    width,
    height,
}: {
    left: number;
    top: number;
    width: number;
    height: number;
}): DOMRect =>
    ({
        x: left,
        y: top,
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
        toJSON: () => ({}),
    }) as DOMRect;

const mockRect = (element: Element, rectRef: { current: DOMRect }) => {
    Object.defineProperty(element, 'getBoundingClientRect', {
        configurable: true,
        value: () => rectRef.current,
    });
};

interface TestHarnessProps {
    side: TestSide;
    align: TestAlign;
    triggerRectRef: { current: DOMRect };
    positionerRectRef: { current: DOMRect };
    offset?: number;
    arrowDimensions?: ArrowDimensions;
}

const DEFAULT_TEST_ARROW_DIMENSIONS: ArrowDimensions = { width: 16, height: 8 };

const TestHarness = ({
    side,
    align,
    triggerRectRef,
    positionerRectRef,
    offset = 12,
    arrowDimensions = DEFAULT_TEST_ARROW_DIMENSIONS,
}: TestHarnessProps) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const positionerRef = useRef<HTMLDivElement>(null);
    const [triggerElement, setTriggerElement] = useState<Element | null>(null);
    const [positionerElement, setPositionerElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (!triggerRef.current || !positionerRef.current) return;

        mockRect(triggerRef.current, triggerRectRef);
        mockRect(positionerRef.current, positionerRectRef);

        setTriggerElement(triggerRef.current);
        setPositionerElement(positionerRef.current);
    }, [positionerRectRef, triggerRectRef]);

    const position = useArrowPosition({
        triggerElement,
        positionerElement,
        side,
        align,
        offset,
        arrowDimensions,
    });

    return (
        <>
            <button ref={triggerRef} type="button">
                Trigger
            </button>
            <div ref={positionerRef} data-testid="positioner" />
            <div data-testid="arrow" style={position} />
        </>
    );
};

describe('getArrowSideStyle', () => {
    it.each([
        ['top', { width: 16, height: 8 }, { bottom: '-8px', transform: 'rotate(180deg)' }],
        ['right', { width: 16, height: 8 }, { left: '-12px', transform: 'rotate(-90deg)' }],
        ['bottom', { width: 16, height: 8 }, { top: '-8px', transform: 'rotate(0deg)' }],
        ['left', { width: 16, height: 8 }, { right: '-12px', transform: 'rotate(90deg)' }],
        ['inline-start', { width: 16, height: 8 }, { right: '-12px', transform: 'rotate(90deg)' }],
        ['inline-end', { width: 16, height: 8 }, { left: '-12px', transform: 'rotate(-90deg)' }],
    ] as const)('maps %s correctly', (side, dimensions, expectedStyle) => {
        expect(getArrowSideStyle(side, dimensions)).toEqual(expectedStyle);
    });

    it('accounts for overlap when computing push-out', () => {
        const dimensions = { width: 16, height: 8, overlap: 1 };

        expect(getArrowSideStyle('top', dimensions)).toEqual({
            bottom: '-7px',
            transform: 'rotate(180deg)',
        });
        expect(getArrowSideStyle('left', dimensions)).toEqual({
            right: '-11px',
            transform: 'rotate(90deg)',
        });
    });
});

describe('useArrowPosition', () => {
    it('computes a left offset for top-start placement', async () => {
        const triggerRectRef = {
            current: createRect({ left: 40, top: 30, width: 20, height: 20 }),
        };
        const positionerRectRef = {
            current: createRect({ left: 10, top: 10, width: 100, height: 100 }),
        };

        const rendered = render(
            <TestHarness
                side="top"
                align="start"
                triggerRectRef={triggerRectRef}
                positionerRectRef={positionerRectRef}
            />,
        );
        const arrow = rendered.getByTestId('arrow');

        await waitFor(() => {
            expect(arrow).toHaveStyle({ left: '42px' });
        });
    });

    it('computes a right offset for bottom-end placement', async () => {
        const triggerRectRef = {
            current: createRect({ left: 40, top: 30, width: 20, height: 20 }),
        };
        const positionerRectRef = {
            current: createRect({ left: 10, top: 10, width: 100, height: 100 }),
        };

        const rendered = render(
            <TestHarness
                side="bottom"
                align="end"
                triggerRectRef={triggerRectRef}
                positionerRectRef={positionerRectRef}
            />,
        );
        const arrow = rendered.getByTestId('arrow');

        await waitFor(() => {
            expect(arrow).toHaveStyle({ right: '62px' });
        });
    });

    it('computes a top offset for left-start placement', async () => {
        const triggerRectRef = {
            current: createRect({ left: 40, top: 30, width: 20, height: 20 }),
        };
        const positionerRectRef = {
            current: createRect({ left: 10, top: 10, width: 100, height: 100 }),
        };

        const rendered = render(
            <TestHarness
                side="left"
                align="start"
                triggerRectRef={triggerRectRef}
                positionerRectRef={positionerRectRef}
            />,
        );
        const arrow = rendered.getByTestId('arrow');

        await waitFor(() => {
            expect(arrow).toHaveStyle({ top: '32px' });
        });
    });

    it('treats logical inline sides like left/right for offset calculations', async () => {
        const triggerRectRef = {
            current: createRect({ left: 40, top: 30, width: 20, height: 20 }),
        };
        const positionerRectRef = {
            current: createRect({ left: 10, top: 10, width: 100, height: 100 }),
        };

        const rendered = render(
            <TestHarness
                side="inline-end"
                align="end"
                triggerRectRef={triggerRectRef}
                positionerRectRef={positionerRectRef}
            />,
        );
        const arrow = rendered.getByTestId('arrow');

        await waitFor(() => {
            expect(arrow).toHaveStyle({ bottom: '72px' });
        });
    });

    it('uses the provided offset when calculating arrow placement', async () => {
        const triggerRectRef = {
            current: createRect({ left: 40, top: 30, width: 20, height: 20 }),
        };
        const positionerRectRef = {
            current: createRect({ left: 10, top: 10, width: 100, height: 100 }),
        };

        const rendered = render(
            <TestHarness
                side="top"
                align="start"
                offset={8}
                triggerRectRef={triggerRectRef}
                positionerRectRef={positionerRectRef}
            />,
        );
        const arrow = rendered.getByTestId('arrow');

        await waitFor(() => {
            expect(arrow).toHaveStyle({ left: '38px' });
        });
    });

    it('recalculates when offset changes', async () => {
        const triggerRectRef = {
            current: createRect({ left: 40, top: 30, width: 20, height: 20 }),
        };
        const positionerRectRef = {
            current: createRect({ left: 10, top: 10, width: 100, height: 100 }),
        };

        const rendered = render(
            <TestHarness
                side="top"
                align="start"
                offset={12}
                triggerRectRef={triggerRectRef}
                positionerRectRef={positionerRectRef}
            />,
        );
        const arrow = rendered.getByTestId('arrow');

        await waitFor(() => {
            expect(arrow).toHaveStyle({ left: '42px' });
        });

        rendered.rerender(
            <TestHarness
                side="top"
                align="start"
                offset={8}
                triggerRectRef={triggerRectRef}
                positionerRectRef={positionerRectRef}
            />,
        );

        await waitFor(() => {
            expect(arrow).toHaveStyle({ left: '38px' });
        });
    });

    it('clamps computed offsets within the positioner bounds', async () => {
        const triggerRectRef = {
            current: createRect({ left: -20, top: 30, width: 20, height: 20 }),
        };
        const positionerRectRef = {
            current: createRect({ left: 10, top: 10, width: 100, height: 100 }),
        };

        const rendered = render(
            <TestHarness
                side="top"
                align="start"
                triggerRectRef={triggerRectRef}
                positionerRectRef={positionerRectRef}
            />,
        );
        const arrow = rendered.getByTestId('arrow');

        await waitFor(() => {
            expect(arrow).toHaveStyle({ left: '12px' });
        });
    });

    it('clears the arrow offset when align changes to center', async () => {
        const triggerRectRef = {
            current: createRect({ left: 40, top: 30, width: 20, height: 20 }),
        };
        const positionerRectRef = {
            current: createRect({ left: 10, top: 10, width: 100, height: 100 }),
        };

        const rendered = render(
            <TestHarness
                side="top"
                align="start"
                triggerRectRef={triggerRectRef}
                positionerRectRef={positionerRectRef}
            />,
        );
        const arrow = rendered.getByTestId('arrow');

        await waitFor(() => {
            expect(arrow).toHaveStyle({ left: '42px' });
        });

        rendered.rerender(
            <TestHarness
                side="top"
                align="center"
                triggerRectRef={triggerRectRef}
                positionerRectRef={positionerRectRef}
            />,
        );

        await waitFor(() => {
            const style = arrow.getAttribute('style');
            expect(style === null || style === '').toBe(true);
        });
    });

    it('recalculates when the positioner style attribute changes', async () => {
        const triggerRectRef = {
            current: createRect({ left: 40, top: 30, width: 20, height: 20 }),
        };
        const positionerRectRef = {
            current: createRect({ left: 10, top: 10, width: 100, height: 100 }),
        };

        const rendered = render(
            <TestHarness
                side="top"
                align="start"
                triggerRectRef={triggerRectRef}
                positionerRectRef={positionerRectRef}
            />,
        );
        const arrow = rendered.getByTestId('arrow');
        const positioner = rendered.getByTestId('positioner');

        await waitFor(() => {
            expect(arrow).toHaveStyle({ left: '42px' });
        });

        positionerRectRef.current = createRect({ left: 30, top: 10, width: 100, height: 100 });
        positioner.style.setProperty('transform', 'translateX(20px)');

        await waitFor(() => {
            expect(arrow).toHaveStyle({ left: '22px' });
        });
    });
});
