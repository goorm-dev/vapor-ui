import { cleanup, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { Meter } from '.';

const LABEL_TEXT = 'Storage used';

const MeterTest = ({ children, ...props }: Partial<Meter.Root.Props>) => (
    <Meter.Root value={42} locale="en-US" {...props}>
        {children ?? (
            <>
                <Meter.Label>{LABEL_TEXT}</Meter.Label>
                <Meter.Track>
                    <Meter.Indicator />
                </Meter.Track>
                <Meter.Value />
            </>
        )}
    </Meter.Root>
);

describe('Meter', () => {
    afterEach(cleanup);

    it('should have no a11y violations', async () => {
        const rendered = render(<MeterTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should expose role="meter" with the value range', () => {
        render(<MeterTest value={42} min={0} max={100} />);
        const meter = screen.getByRole('meter');

        expect(meter).toHaveAttribute('aria-valuemin', '0');
        expect(meter).toHaveAttribute('aria-valuemax', '100');
        expect(meter).toHaveAttribute('aria-valuenow', '42');
    });

    it('should clamp values outside the range', () => {
        const { unmount } = render(<MeterTest value={150} />);
        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
        unmount();

        render(<MeterTest value={-5} />);
        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
    });

    it('should use the label as the accessible name', () => {
        render(<MeterTest />);

        expect(screen.getByRole('meter')).toHaveAccessibleName(LABEL_TEXT);
    });

    it('should format `aria-valuetext` with the given `format` instead of a percentage', () => {
        const { unmount } = render(<MeterTest value={42} />);
        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '42%');
        unmount();

        render(<MeterTest value={4.2} format={{ style: 'unit', unit: 'gigabyte' }} />);
        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '4.2 GB');
    });

    describe('development warnings', () => {
        let warn: ReturnType<typeof vi.spyOn>;

        beforeEach(() => {
            warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        });

        afterEach(() => {
            warn.mockRestore();
        });

        it('should warn when `min` is not less than `max`', () => {
            render(<MeterTest min={100} max={0} />);

            expect(warn).toHaveBeenCalledWith(expect.stringContaining('`min` must be less than'));
        });

        it('should warn when the meter has no accessible name', () => {
            render(
                <MeterTest>
                    <Meter.Track>
                        <Meter.Indicator />
                    </Meter.Track>
                </MeterTest>,
            );

            expect(warn).toHaveBeenCalledWith(
                expect.stringContaining('Meter has no accessible name'),
            );
        });

        it('should stay silent when only `aria-label` is given', () => {
            render(
                <MeterTest aria-label={LABEL_TEXT}>
                    <Meter.Track>
                        <Meter.Indicator />
                    </Meter.Track>
                </MeterTest>,
            );

            expect(warn).not.toHaveBeenCalled();
        });
    });
});
