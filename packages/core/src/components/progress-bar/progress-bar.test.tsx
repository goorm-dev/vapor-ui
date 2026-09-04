import type { ReactElement } from 'react';

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
        <ProgressBar.Track />
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

        it('should forward a callback ref to the progressbar element', () => {
            const ref = vi.fn();
            const { container } = render(
                <ProgressBar.Root value={42} aria-label="파일 업로드" ref={ref}>
                    <ProgressBar.Track />
                </ProgressBar.Root>,
            );

            expect(ref).toHaveBeenCalledWith(getBar(container));
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

        it('should warn and pass an inverted range through untouched', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { container } = render(<ProgressBarTest value={50} min={100} max={0} />);
            const bar = getBar(container);

            expect(bar).toHaveAttribute('aria-valuemin', '100');
            expect(bar).toHaveAttribute('aria-valuemax', '0');
            expect(warn).toHaveBeenCalledWith(
                'Vapor UI: ProgressBar received min={100} and max={0}. `min` must be less than `max` for the value to be meaningful.',
            );

            warn.mockRestore();
        });

        it('should warn when the range is empty', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const { container } = render(<ProgressBarTest value={50} min={20} max={20} />);
            const bar = getBar(container);

            expect(bar).toHaveAttribute('aria-valuemin', '20');
            expect(bar).toHaveAttribute('aria-valuemax', '20');
            expect(warn).toHaveBeenCalledWith(
                'Vapor UI: ProgressBar received min={20} and max={20}. `min` must be less than `max` for the value to be meaningful.',
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

        it('should announce the supplied text and leave the visible value alone', () => {
            const { container, getByText } = render(
                <ProgressBarTest value={3} max={8} getAriaValueText={() => '8개 중 3개'} />,
            );

            expect(getBar(container)).toHaveAttribute('aria-valuetext', '8개 중 3개');
            expect(getByText('38%')).toBeInTheDocument();
        });

        it('should let a Value children function mirror the announced text', () => {
            const { getByText } = render(
                <ProgressBar.Root value={3} max={8} aria-label="파일 업로드">
                    <ProgressBar.Value>{(_, value) => `8개 중 ${value}개`}</ProgressBar.Value>
                    <ProgressBar.Track />
                </ProgressBar.Root>,
            );

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

        it('should flag the indicator as indeterminate and give it no fill width', () => {
            const { container } = render(<ProgressBarTest value={null} />);
            const indicator = getIndicator(container)!;

            // The sweep is keyed off `data-indeterminate`; an inline width would read as a fill.
            expect(indicator).toHaveAttribute('data-indeterminate');
            expect(indicator.style.width).toBe('');
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
            expect(getByText('3')).toBeInTheDocument();
        });
    });

    describe('Track', () => {
        it('should render an indicator inside `ProgressBar.Track` by default', () => {
            const { container } = render(<ProgressBarTest value={42} />);

            expect(getIndicator(container)).toHaveStyle({ width: '42%' });
        });

        it('should render the custom `indicatorElement` instead of the default indicator', () => {
            const { getByTestId } = render(
                <ProgressBar.Root value={42} aria-label="파일 업로드">
                    <ProgressBar.Track
                        data-testid="track"
                        indicatorElement={
                            <ProgressBar.IndicatorPrimitive data-testid="indicator" />
                        }
                    />
                </ProgressBar.Root>,
            );

            const track = getByTestId('track');
            expect(track.childElementCount).toBe(1);
            expect(track.firstElementChild).toBe(getByTestId('indicator'));
            expect(getByTestId('indicator')).toHaveStyle({ width: '42%' });
        });

        it('should render no indicator when `ProgressBar.TrackPrimitive` is used directly', () => {
            const { getByTestId } = render(
                <ProgressBar.Root value={42} aria-label="파일 업로드">
                    <ProgressBar.TrackPrimitive data-testid="track" />
                </ProgressBar.Root>,
            );

            expect(getByTestId('track')).toBeEmptyDOMElement();
        });
    });

    describe('size', () => {
        it('should default to md', () => {
            const { container } = render(<ProgressBarTest value={42} />);

            expect(getTrack(container)!.className).toMatch(/size_md/);
        });

        it.each(['sm', 'md', 'lg'] as const)('should mark the track with size="%s"', (size) => {
            const { container } = render(<ProgressBarTest value={42} size={size} />);

            expect(getTrack(container)!.className).toMatch(new RegExp(`size_${size}`));
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

        it('should keep the Label text as the name when aria-label is also supplied', () => {
            const { container } = render(
                <ProgressBarTest value={42} label="파일 업로드" aria-label="Upload" />,
            );

            expect(getBar(container)).toHaveAccessibleName('파일 업로드');
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
                    <ProgressBar.Track />
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

        it('should keep every mounted Description and drop only the one that unmounts', async () => {
            const Twice = ({ second = true }: { second?: boolean }) => (
                <ProgressBar.Root value={42} aria-label="파일 업로드">
                    <ProgressBar.Track />
                    <ProgressBar.Description id="first">첫 설명</ProgressBar.Description>
                    {second && (
                        <ProgressBar.Description id="second">둘째 설명</ProgressBar.Description>
                    )}
                </ProgressBar.Root>
            );
            const { container, rerender } = render(<Twice />);

            await waitFor(() =>
                expect(getBar(container)).toHaveAttribute('aria-describedby', 'first second'),
            );

            rerender(<Twice second={false} />);

            await waitFor(() =>
                expect(getBar(container)).toHaveAttribute('aria-describedby', 'first'),
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

        it('should strip its role so a render swap cannot leak a heading into the bar', () => {
            const { getByText } = render(<Described />);

            expect(getByText('10MB 중 4.2MB 전송했습니다')).toHaveAttribute('role', 'presentation');
        });

        it.each([
            [null, 'indeterminate'],
            [42, 'progressing'],
            [100, 'complete'],
            [150, 'complete'],
        ])('should expose status to render when value is %s', (value, status) => {
            const { getByTestId } = render(
                <ProgressBar.Root value={value} aria-label="파일 업로드">
                    <ProgressBar.Track />
                    <ProgressBar.Description
                        render={(props, state) => (
                            <span {...props} data-testid="desc">
                                {state.status}
                            </span>
                        )}
                    />
                </ProgressBar.Root>,
            );

            expect(getByTestId('desc')).toHaveTextContent(status);
        });
    });

    describe('Value', () => {
        it('should hand the formatted and raw value to a `children` function', () => {
            const children = vi.fn(
                (formatted: string | null, value: number | null) => `${formatted} (${value})`,
            );
            const { getByText } = render(
                <ProgressBar.Root value={15} min={10} max={20} aria-label="파일 업로드">
                    <ProgressBar.Value>{children}</ProgressBar.Value>
                    <ProgressBar.Track />
                </ProgressBar.Root>,
            );

            expect(children).toHaveBeenCalledWith('50%', 15);
            expect(getByText('50% (15)')).toBeInTheDocument();
        });
    });

    describe('shared props', () => {
        const shared = {
            'data-testid': 'part',
            className: 'custom',
            style: { color: 'rgb(1, 2, 3)' },
            render: <section />,
        };

        const parts: Record<string, () => ReactElement> = {
            Root: () => (
                <ProgressBar.Root value={42} aria-label="파일 업로드" {...shared}>
                    <ProgressBar.Track />
                </ProgressBar.Root>
            ),
            Label: () => (
                <ProgressBar.Root value={42}>
                    <ProgressBar.Label {...shared}>파일 업로드</ProgressBar.Label>
                    <ProgressBar.Track />
                </ProgressBar.Root>
            ),
            Value: () => (
                <ProgressBar.Root value={42} aria-label="파일 업로드">
                    <ProgressBar.Value {...shared} />
                    <ProgressBar.Track />
                </ProgressBar.Root>
            ),
            Track: () => (
                <ProgressBar.Root value={42} aria-label="파일 업로드">
                    <ProgressBar.Track {...shared} />
                </ProgressBar.Root>
            ),
            TrackPrimitive: () => (
                <ProgressBar.Root value={42} aria-label="파일 업로드">
                    <ProgressBar.TrackPrimitive {...shared} />
                </ProgressBar.Root>
            ),
            IndicatorPrimitive: () => (
                <ProgressBar.Root value={42} aria-label="파일 업로드">
                    <ProgressBar.Track
                        indicatorElement={<ProgressBar.IndicatorPrimitive {...shared} />}
                    />
                </ProgressBar.Root>
            ),
            Description: () => (
                <ProgressBar.Root value={42} aria-label="파일 업로드">
                    <ProgressBar.Track />
                    <ProgressBar.Description {...shared}>설명</ProgressBar.Description>
                </ProgressBar.Root>
            ),
        };

        it.each(Object.keys(parts))(
            'should pass className, style and render through `ProgressBar.%s`',
            (name) => {
                const { getByTestId } = render(parts[name]());
                const part = getByTestId('part');

                expect(part.tagName).toBe('SECTION');
                expect(part).toHaveClass('custom');
                expect(part).toHaveStyle({ color: 'rgb(1, 2, 3)' });
            },
        );
    });
});
