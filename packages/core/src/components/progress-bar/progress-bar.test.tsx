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

/** The Track is the only `<div>` child of the Root — Label and Value both render spans. */
const getTrack = (container: HTMLElement) =>
    container.querySelector('[role="progressbar"] > div') as HTMLElement | null;

const getIndicator = (container: HTMLElement) =>
    getTrack(container)?.firstElementChild as HTMLElement | null;

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

        it('should fall back to 0–100 when the range is empty', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { container } = render(<ProgressBarTest value={50} min={20} max={20} />);
            const bar = getBar(container);

            expect(bar).toHaveAttribute('aria-valuemin', '0');
            expect(bar).toHaveAttribute('aria-valuemax', '100');
            expect(warn).toHaveBeenCalledWith(
                'Vapor UI: ProgressBar received min={20} and max={20}. `min` must be less than `max`. Falling back to 0–100.',
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

        it('should show no value text at all when indeterminate', () => {
            const { container } = render(<ProgressBarTest value={null} />);

            expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('');
        });
    });

    describe('value text, visible text and fill agree', () => {
        it.each([
            { value: 0, expected: '0%', fill: '0%' },
            { value: 42, expected: '42%', fill: '42%' },
            { value: 100, expected: '100%', fill: '100%' },
        ])('on the default range at value $value', ({ value, expected, fill }) => {
            const { container, getByText } = render(<ProgressBarTest value={value} />);

            expect(getBar(container)).toHaveAttribute('aria-valuenow', String(value));
            expect(getByText(expected)).toBeInTheDocument();
            expect(getIndicator(container)).toHaveStyle({ width: fill });
        });

        it.each([
            { value: 10, expected: '0%', fill: '0%' },
            { value: 15, expected: '50%', fill: '50%' },
            { value: 20, expected: '100%', fill: '100%' },
        ])('on a 10–20 range at value $value', ({ value, expected, fill }) => {
            const { container, getByText } = render(
                <ProgressBarTest value={value} min={10} max={20} />,
            );

            expect(getBar(container)).toHaveAttribute('aria-valuenow', String(value));
            expect(getByText(expected)).toBeInTheDocument();
            expect(getIndicator(container)).toHaveStyle({ width: fill });
        });
    });

    describe('locale and format', () => {
        it.each(['ko-KR', 'de-DE', 'ar-EG'])('should format the value text in %s', (locale) => {
            const expected = new Intl.NumberFormat(locale, { style: 'percent' }).format(0.42);
            const { container } = render(<ProgressBarTest value={42} locale={locale} />);

            // Not `getByText`: some locales separate the sign with a non-breaking space,
            // which the default matcher normalises away.
            expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe(expected);
            // `aria-valuenow` still carries the raw number, so no `aria-valuetext` is needed.
            expect(getBar(container)).not.toHaveAttribute('aria-valuetext');
        });

        it('should let `format` replace the percentage entirely', () => {
            const { container, getByText } = render(
                <ProgressBarTest
                    value={4200}
                    max={10000}
                    locale="ko-KR"
                    format={{ style: 'decimal' }}
                />,
            );

            expect(getByText('4,200')).toBeInTheDocument();
            expect(getBar(container)).toHaveAttribute('aria-valuenow', '4200');
            expect(getIndicator(container)).toHaveStyle({ width: '42%' });
        });

        it('should announce the formatted text when a reader needs it spelled out', () => {
            const { container, getByText } = render(
                <ProgressBarTest
                    value={3}
                    max={8}
                    getAriaValueText={(formatted) => `8단계 중 ${formatted}`}
                    format={{ style: 'decimal' }}
                />,
            );

            expect(getBar(container)).toHaveAttribute('aria-valuetext', '8단계 중 3');
            expect(getByText('8단계 중 3')).toBeInTheDocument();
        });
    });

    describe('type="error"', () => {
        it('should render no indicator', () => {
            const { container } = render(<ProgressBarTest value={42} type="error" />);

            expect(getTrack(container)).toBeInTheDocument();
            expect(getIndicator(container)).toBeNull();
        });

        it('should mark the track with the error variant', () => {
            const { container, rerender } = render(<ProgressBarTest value={42} />);
            const defaultClass = getTrack(container)!.className;

            rerender(<ProgressBarTest value={42} type="error" />);

            expect(getTrack(container)!.className).not.toBe(defaultClass);
            expect(getTrack(container)!.className).toMatch(/type_error/);
        });

        it('should keep the value in the accessibility tree', () => {
            const { container } = render(<ProgressBarTest value={42} type="error" />);

            expect(getBar(container)).toHaveAttribute('aria-valuenow', '42');
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

        it('should take its name from the Label text', () => {
            const { container } = render(<ProgressBarTest value={42} label="백업 진행률" />);

            expect(getBar(container)).toHaveAccessibleName('백업 진행률');
        });

        it('should not warn when aria-labelledby points outside the component', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { container } = render(
                <>
                    <span id="external-name">파일 업로드</span>
                    <ProgressBarTest value={42} label={null} aria-labelledby="external-name" />
                </>,
            );
            await new Promise((resolve) => setTimeout(resolve, 0));

            expect(getBar(container)).toHaveAccessibleName('파일 업로드');
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

    describe('Description', () => {
        const Described = (
            props: Partial<ProgressBar.Root.Props> & { id?: string; description?: string },
        ) => {
            const {
                id,
                description = '10MB 중 4.2MB 전송했습니다',
                value = 42,
                ...rootProps
            } = props;

            return (
                <ProgressBar.Root value={value} aria-label="파일 업로드" {...rootProps}>
                    <ProgressBar.Track>
                        <ProgressBar.Indicator />
                    </ProgressBar.Track>
                    <ProgressBar.Description id={id}>{description}</ProgressBar.Description>
                </ProgressBar.Root>
            );
        };

        it('should describe the bar with a generated id', async () => {
            const { container } = render(<Described />);

            await waitFor(() =>
                expect(getBar(container)).toHaveAccessibleDescription('10MB 중 4.2MB 전송했습니다'),
            );
        });

        it('should prefer an id supplied by the consumer', async () => {
            const { container, getByText } = render(<Described id="upload-hint" />);

            expect(getByText('10MB 중 4.2MB 전송했습니다')).toHaveAttribute('id', 'upload-hint');
            await waitFor(() =>
                expect(getBar(container)).toHaveAttribute(
                    'aria-describedby',
                    expect.stringContaining('upload-hint'),
                ),
            );
        });

        it('should append to a describedby the consumer wired up', async () => {
            const { container } = render(
                <>
                    <span id="external">전송 중</span>
                    <Described aria-describedby="external" id="upload-hint" />
                </>,
            );

            await waitFor(() =>
                expect(getBar(container)).toHaveAttribute(
                    'aria-describedby',
                    'external upload-hint',
                ),
            );
        });

        it('should leave describedby off when no Description is rendered', () => {
            const { container } = render(<ProgressBarTest value={42} />);

            expect(getBar(container)).not.toHaveAttribute('aria-describedby');
        });

        it('should take its tone from the Root type', () => {
            const { getByText, rerender } = render(<Described />);
            const defaultClass = getByText('10MB 중 4.2MB 전송했습니다').className;

            rerender(<Described type="error" />);

            expect(getByText('10MB 중 4.2MB 전송했습니다').className).not.toBe(defaultClass);
        });
    });
});
