import { cleanup, render, waitFor } from '@testing-library/react';

import type { ArrowOffset, ArrowPositionAlign, ArrowPositionSide } from './use-arrow-position';
import { useArrowPosition } from './use-arrow-position';

interface HarnessProps {
    offset?: ArrowOffset;
    initialSide?: ArrowPositionSide;
    initialAlign?: ArrowPositionAlign;
    popupSide?: ArrowPositionSide;
    popupAlign?: ArrowPositionAlign;
}

const Harness = ({ offset, initialSide, initialAlign, popupSide, popupAlign }: HarnessProps) => {
    const { popupRef, arrowRef, position } = useArrowPosition({
        offset,
        initialSide,
        initialAlign,
    });

    return (
        <div
            data-testid="popup"
            ref={popupRef as React.RefObject<HTMLDivElement>}
            data-side={popupSide}
            data-align={popupAlign}
        >
            <div
                data-testid="arrow"
                ref={arrowRef as (node: HTMLDivElement | null) => void}
                data-position={JSON.stringify(position)}
            />
        </div>
    );
};

describe('useArrowPosition', () => {
    afterEach(cleanup);

    describe('given default options', () => {
        it('should return an empty position object when the popup has no data attributes', () => {
            const rendered = render(<Harness />);
            const arrow = rendered.getByTestId('arrow');

            expect(arrow).toHaveAttribute('data-position', '{}');
        });
    });

    describe('prop: initialSide / initialAlign', () => {
        it('should resolve the initial position before the popup element mounts', () => {
            const rendered = render(<Harness initialSide="top" initialAlign="start" />);
            const arrow = rendered.getByTestId('arrow');

            expect(arrow).toHaveAttribute(
                'data-position',
                JSON.stringify({ left: 12, right: 'unset' }),
            );
        });
    });

    describe('popupRef data attribute reading', () => {
        it('should read `data-side` and `data-align` from the popup element on mount', async () => {
            const rendered = render(<Harness popupSide="right" popupAlign="end" />);
            const arrow = rendered.getByTestId('arrow');

            await waitFor(() =>
                expect(arrow).toHaveAttribute(
                    'data-position',
                    JSON.stringify({ top: 'unset', bottom: 12 }),
                ),
            );
        });
    });

    describe('arrowRef mutation observation', () => {
        it('should update the position when the arrow element `data-side` attribute changes', async () => {
            const rendered = render(<Harness initialAlign="start" />);
            const arrow = rendered.getByTestId('arrow');

            arrow.setAttribute('data-side', 'left');

            await waitFor(() =>
                expect(arrow).toHaveAttribute(
                    'data-position',
                    JSON.stringify({ top: 12, bottom: 'unset' }),
                ),
            );
        });

        it('should update the position when the arrow element `data-align` attribute changes', async () => {
            const rendered = render(<Harness initialSide="top" initialAlign="center" />);
            const arrow = rendered.getByTestId('arrow');

            arrow.setAttribute('data-align', 'end');

            await waitFor(() =>
                expect(arrow).toHaveAttribute(
                    'data-position',
                    JSON.stringify({ left: 'unset', right: 12 }),
                ),
            );
        });
    });

    describe('prop: offset', () => {
        it('should use a numeric offset directly', () => {
            const rendered = render(<Harness initialSide="top" initialAlign="start" offset={20} />);
            const arrow = rendered.getByTestId('arrow');

            expect(arrow).toHaveAttribute(
                'data-position',
                JSON.stringify({ left: 20, right: 'unset' }),
            );
        });

        it('should invoke a function offset with the current side', () => {
            const offset = vi.fn((side: ArrowPositionSide | undefined) =>
                side === 'top' ? 24 : 8,
            );

            const rendered = render(
                <Harness initialSide="top" initialAlign="start" offset={offset} />,
            );
            const arrow = rendered.getByTestId('arrow');

            expect(offset).toHaveBeenCalledWith('top');
            expect(arrow).toHaveAttribute(
                'data-position',
                JSON.stringify({ left: 24, right: 'unset' }),
            );
        });

        it('should recompute the function offset when the side changes', async () => {
            const offset = (side: ArrowPositionSide | undefined) =>
                side === 'top' || side === 'bottom' ? 12 : 6;

            const rendered = render(
                <Harness initialSide="top" initialAlign="start" offset={offset} />,
            );
            const arrow = rendered.getByTestId('arrow');

            arrow.setAttribute('data-side', 'left');

            await waitFor(() =>
                expect(arrow).toHaveAttribute(
                    'data-position',
                    JSON.stringify({ top: 6, bottom: 'unset' }),
                ),
            );
        });
    });

    describe('position map', () => {
        it.each<[ArrowPositionSide, ArrowPositionAlign, Record<string, number | string>]>([
            ['top', 'start', { left: 12, right: 'unset' }],
            ['top', 'end', { left: 'unset', right: 12 }],
            ['bottom', 'start', { left: 12, right: 'unset' }],
            ['bottom', 'end', { left: 'unset', right: 12 }],
            ['left', 'start', { top: 12, bottom: 'unset' }],
            ['left', 'end', { top: 'unset', bottom: 12 }],
            ['right', 'start', { top: 12, bottom: 'unset' }],
            ['right', 'end', { top: 'unset', bottom: 12 }],
        ])('should return the correct position for side=%s align=%s', (side, align, expected) => {
            const rendered = render(<Harness initialSide={side} initialAlign={align} />);
            const arrow = rendered.getByTestId('arrow');

            expect(arrow).toHaveAttribute('data-position', JSON.stringify(expected));
        });

        it('should return an empty object when `align` is center', () => {
            const rendered = render(<Harness initialSide="top" initialAlign="center" />);
            const arrow = rendered.getByTestId('arrow');

            expect(arrow).toHaveAttribute('data-position', '{}');
        });

        it('should return an empty object for sides without a map entry (`inline-start`, `inline-end`)', () => {
            const rendered = render(<Harness initialSide="inline-start" initialAlign="start" />);
            const arrow = rendered.getByTestId('arrow');

            expect(arrow).toHaveAttribute('data-position', '{}');
        });
    });
});
