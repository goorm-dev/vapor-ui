import { cleanup, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { Meter } from '.';
import * as styles from './meter.css';

const LABEL_TEXT = 'Storage used';

const MeterTest = ({ children, ...props }: Partial<Meter.Root.Props>) => (
    <Meter.Root value={42} locale="en-US" {...props}>
        {children ?? (
            <>
                <Meter.Label>{LABEL_TEXT}</Meter.Label>
                <Meter.Track />
                <Meter.Value />
            </>
        )}
    </Meter.Root>
);

describe('Meter', () => {
    afterEach(cleanup);

    it('should only accept supported locales', () => {
        expectTypeOf<Meter.Root.Props['locale']>().toEqualTypeOf<
            'ko-KR' | 'ja-JP' | 'en-US' | undefined
        >();
    });

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

    it('should let `getAriaValueText` replace the generated value text', () => {
        render(
            <MeterTest
                value={4.2}
                max={20}
                format={{ style: 'unit', unit: 'gigabyte' }}
                getAriaValueText={(formatted, value) => `${formatted} of 20 GB (${value})`}
            />,
        );

        expect(screen.getByRole('meter')).toHaveAttribute(
            'aria-valuetext',
            '4.2 GB of 20 GB (4.2)',
        );
    });

    it('should let `aria-valuetext` override the generated value text', () => {
        render(<MeterTest value={42} aria-valuetext="42GB used out of 100GB" />);

        expect(screen.getByRole('meter')).toHaveAttribute(
            'aria-valuetext',
            '42GB used out of 100GB',
        );
    });

    it('should format the value with the given `locale`', () => {
        render(
            <MeterTest value={4.2} locale="ko-KR" format={{ style: 'unit', unit: 'gigabyte' }} />,
        );

        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '4.2GB');
    });

    it('should hide the value text from assistive technology', () => {
        render(<MeterTest value={42} />);

        expect(screen.getByText('42%')).toHaveAttribute('aria-hidden', 'true');
    });

    it('should not set `aria-labelledby` when no label is rendered', () => {
        render(
            <MeterTest aria-label={LABEL_TEXT}>
                <Meter.Track />
            </MeterTest>,
        );

        expect(screen.getByRole('meter')).not.toHaveAttribute('aria-labelledby');
    });

    it('should point `aria-labelledby` at the rendered label', () => {
        const { container } = render(<MeterTest />);
        const labelledBy = screen.getByRole('meter').getAttribute('aria-labelledby');

        expect(labelledBy).toBeTruthy();
        expect(container.querySelector(`#${labelledBy}`)).toHaveTextContent(LABEL_TEXT);
    });

    it('should give each instance its own label id', () => {
        const { container } = render(
            <>
                <MeterTest />
                <MeterTest />
                <MeterTest />
            </>,
        );

        const ids = screen
            .getAllByRole('meter')
            .map((meter) => meter.getAttribute('aria-labelledby'));

        expect(new Set(ids).size).toBe(ids.length);
        ids.forEach((id) => {
            expect(container.querySelector(`#${id}`)).toBeInTheDocument();
        });
    });

    it('should use `aria-label` as the accessible name', () => {
        render(
            <MeterTest aria-label="Disk usage">
                <Meter.Track />
            </MeterTest>,
        );

        expect(screen.getByRole('meter')).toHaveAccessibleName('Disk usage');
    });

    it('should use `aria-labelledby` as the accessible name', () => {
        render(
            <>
                <h2 id="external-heading">Disk usage</h2>
                <MeterTest aria-labelledby="external-heading">
                    <Meter.Track />
                </MeterTest>
            </>,
        );

        expect(screen.getByRole('meter')).toHaveAccessibleName('Disk usage');
    });

    it('should apply `size` to the track and `type` to the indicator', () => {
        render(
            <MeterTest size="lg" type="warning" aria-label={LABEL_TEXT}>
                <Meter.Track data-testid="track">
                    <Meter.IndicatorPrimitive data-testid="indicator" />
                </Meter.Track>
            </MeterTest>,
        );

        expect(screen.getByTestId('track')).toHaveClass(styles.track({ size: 'lg' }));
        expect(screen.getByTestId('indicator')).toHaveClass(styles.indicator({ type: 'warning' }));
        expect(screen.getByTestId('indicator')).not.toHaveClass(
            styles.indicator({ type: 'default' }),
        );
    });

    it('should render an indicator inside `Meter.Track` by default', () => {
        render(
            <MeterTest type="warning" aria-label={LABEL_TEXT}>
                <Meter.Track data-testid="track" />
            </MeterTest>,
        );

        const indicator = screen.getByTestId('track').firstElementChild;

        expect(indicator).toHaveClass(styles.indicator({ type: 'warning' }));
    });

    it('should render no indicator when `Meter.TrackPrimitive` is used directly', () => {
        render(
            <MeterTest aria-label={LABEL_TEXT}>
                <Meter.TrackPrimitive data-testid="track" />
            </MeterTest>,
        );

        expect(screen.getByTestId('track')).toBeEmptyDOMElement();
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
                    <Meter.Track />
                </MeterTest>,
            );

            expect(warn).toHaveBeenCalledWith(
                expect.stringContaining('Meter has no accessible name'),
            );
        });

        it('should stay silent when `Meter.Label` names the meter', () => {
            render(<MeterTest />);

            expect(warn).not.toHaveBeenCalled();
        });

        it('should stay silent when only `aria-label` is given', () => {
            render(
                <MeterTest aria-label={LABEL_TEXT}>
                    <Meter.Track />
                </MeterTest>,
            );

            expect(warn).not.toHaveBeenCalled();
        });
    });
});
