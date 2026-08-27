import { cleanup, render, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { ProgressBar } from '.';

const ProgressBarTest = ({
    label = '파일 업로드',
    ...props
}: ProgressBar.Root.Props & { label?: string | null }) => (
    <ProgressBar.Root {...props}>
        {label === null ? null : <ProgressBar.Label>{label}</ProgressBar.Label>}
        <ProgressBar.Value />
        <ProgressBar.Track>
            <ProgressBar.Indicator />
        </ProgressBar.Track>
    </ProgressBar.Root>
);

const getBar = (container: HTMLElement) =>
    container.querySelector('[role="progressbar"]') as HTMLElement;

describe('<ProgressBar />', () => {
    afterEach(cleanup);

    it('should have no a11y violations', async () => {
        const { container } = render(<ProgressBarTest value={42} />);
        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    describe('base implementation contract', () => {
        it('should expose role, name and the declared range', () => {
            const { container } = render(<ProgressBarTest value={15} min={10} max={20} />);
            const bar = getBar(container);

            expect(bar).toHaveAttribute('aria-valuenow', '15');
            expect(bar).toHaveAttribute('aria-valuemin', '10');
            expect(bar).toHaveAttribute('aria-valuemax', '20');
            expect(bar).toHaveAccessibleName('파일 업로드');
        });

        it('should hide the visible value from assistive technology', () => {
            const { getByText } = render(<ProgressBarTest value={42} />);

            expect(getByText('42%')).toHaveAttribute('aria-hidden', 'true');
        });

        it('should give every instance a unique label id', () => {
            const { container } = render(
                <>
                    <ProgressBarTest value={10} label="첫째" />
                    <ProgressBarTest value={20} label="둘째" />
                </>,
            );
            const ids = Array.from(container.querySelectorAll('[role="progressbar"]')).map((n) =>
                n.getAttribute('aria-labelledby'),
            );

            expect(ids[0]).toBeTruthy();
            expect(ids[0]).not.toBe(ids[1]);
        });
    });

    describe('value contract', () => {
        it('should clamp a value above the range', () => {
            const { container } = render(<ProgressBarTest value={150} />);

            expect(getBar(container)).toHaveAttribute('aria-valuenow', '100');
        });

        it('should clamp a value below the range', () => {
            const { container } = render(<ProgressBarTest value={-30} />);

            expect(getBar(container)).toHaveAttribute('aria-valuenow', '0');
        });

        it('should fall back to 0–100 when the range is inverted', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { container } = render(<ProgressBarTest value={50} min={100} max={0} />);
            const bar = getBar(container);

            expect(bar).toHaveAttribute('aria-valuemin', '0');
            expect(bar).toHaveAttribute('aria-valuemax', '100');
            expect(warn).toHaveBeenCalledWith(
                'Vapor UI: ProgressBar received min={100} and max={0}. `min` must be less than `max`. Falling back to 0–100.',
            );

            warn.mockRestore();
        });

        it('should scale the value text by the declared range, not by 100', () => {
            const { getByText } = render(<ProgressBarTest value={15} min={10} max={20} />);

            expect(getByText('50%')).toBeInTheDocument();
        });

        it('should not write aria-valuetext by default', () => {
            const { container } = render(<ProgressBarTest value={42} />);

            expect(getBar(container)).not.toHaveAttribute('aria-valuetext');
        });

        it('should announce and display the same text when one is supplied', () => {
            const { container, getByText } = render(
                <ProgressBarTest value={3} max={8} getAriaValueText={() => '8개 중 3개'} />,
            );

            expect(getBar(container)).toHaveAttribute('aria-valuetext', '8개 중 3개');
            expect(getByText('8개 중 3개')).toBeInTheDocument();
        });

        it('should omit aria-valuenow and inject no English text when indeterminate', () => {
            const { container } = render(<ProgressBarTest value={null} />);
            const bar = getBar(container);

            expect(bar).not.toHaveAttribute('aria-valuenow');
            expect(bar).toHaveAttribute('data-indeterminate');
            expect(bar).not.toHaveAttribute('aria-valuetext');
        });
    });

    describe('accessible name', () => {
        it('should warn when nothing names the progress bar', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            render(<ProgressBarTest value={42} label={null} />);

            await waitFor(() =>
                expect(warn).toHaveBeenCalledWith(
                    'Vapor UI: ProgressBar has no accessible name. Render a `ProgressBar.Label`, or pass `aria-label` / `aria-labelledby` to `ProgressBar.Root`.',
                ),
            );

            warn.mockRestore();
        });

        it('should not warn when a Label is rendered', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { container } = render(<ProgressBarTest value={42} />);

            await waitFor(() => expect(getBar(container)).toHaveAccessibleName('파일 업로드'));
            await new Promise((resolve) => setTimeout(resolve, 0));

            expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('no accessible name'));

            warn.mockRestore();
        });

        it('should not warn when aria-label is supplied', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            render(<ProgressBarTest value={42} label={null} aria-label="파일 업로드" />);
            await new Promise((resolve) => setTimeout(resolve, 0));

            expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('no accessible name'));

            warn.mockRestore();
        });
    });

    describe('Status', () => {
        it('should announce without moving focus', () => {
            const { getByRole } = render(<ProgressBar.Status>업로드 완료</ProgressBar.Status>);

            expect(getByRole('status')).toHaveTextContent('업로드 완료');
        });
    });
});
