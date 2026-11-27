import { useState } from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Calendar } from '.';
import type { CalendarRange } from '.';
import { addMonths, getWeeks } from './date-utils';

const NOV_2026 = new Date(2026, 10, 1);

const day = (rendered: ReturnType<typeof render>, label: string) =>
    rendered.getByRole('button', { name: label });

interface SingleCalendarProps {
    defaultValue?: Date;
    disabled?: boolean;
    onValueChange?: (value: Date | null, eventDetails: Calendar.Root.ChangeEventDetails) => void;
}

const SingleCalendar = (props: SingleCalendarProps) => (
    <Calendar.Root defaultMonth={NOV_2026} {...props}>
        <Calendar.Header />
        <Calendar.Grid />
    </Calendar.Root>
);

describe('date-utils', () => {
    it('clamps to the last day of the month', () => {
        expect(addMonths(new Date(2024, 0, 31), 1)).toEqual(new Date(2024, 1, 29));
        expect(addMonths(new Date(2025, 2, 31), -1)).toEqual(new Date(2025, 1, 28));
        expect(addMonths(new Date(2026, 11, 15), 1)).toEqual(new Date(2027, 0, 15));
    });

    it('builds six weeks starting on the given weekday', () => {
        const sunday = getWeeks(NOV_2026, 0);
        expect(sunday).toHaveLength(6);
        expect(sunday[0][0]).toEqual(new Date(2026, 10, 1));

        const monday = getWeeks(NOV_2026, 1);
        expect(monday[0][0]).toEqual(new Date(2026, 9, 26));
    });
});

describe('<Calendar />', () => {
    afterEach(cleanup);

    it('should have no accessibility violations', async () => {
        const rendered = render(<SingleCalendar defaultValue={new Date(2026, 10, 12)} />);

        expect(await axe(rendered.container)).toHaveNoViolations();
    });

    it('renders a Korean month title and weekday headers by default', () => {
        const rendered = render(<SingleCalendar />);

        expect(rendered.getByText('2026년 11월')).toBeInTheDocument();
        const headers = rendered.getAllByRole('columnheader').map((th) => th.textContent);
        expect(headers).toEqual(['일', '월', '화', '수', '목', '금', '토']);
    });

    it('moves between months with the previous and next buttons', async () => {
        const rendered = render(<SingleCalendar />);

        await userEvent.click(rendered.getByRole('button', { name: '다음 달' }));
        expect(rendered.getByText('2026년 12월')).toBeInTheDocument();

        await userEvent.click(rendered.getByRole('button', { name: '이전 달' }));
        await userEvent.click(rendered.getByRole('button', { name: '이전 달' }));
        expect(rendered.getByText('2026년 10월')).toBeInTheDocument();
    });

    describe('single selection', () => {
        it('selects the pressed day', async () => {
            const onValueChange = vi.fn();
            const rendered = render(<SingleCalendar onValueChange={onValueChange} />);

            await userEvent.click(day(rendered, '2026년 11월 12일 목요일'));

            expect(onValueChange.mock.calls[0][0]).toEqual(new Date(2026, 10, 12));
            const button = day(rendered, '2026년 11월 12일 목요일');
            expect(button).toHaveAttribute('data-selected');
            expect(button.closest('td')).toHaveAttribute('aria-selected', 'true');
        });

        it('keeps the value when the change is canceled', async () => {
            const rendered = render(
                <SingleCalendar onValueChange={(_, details) => details.cancel()} />,
            );

            await userEvent.click(day(rendered, '2026년 11월 12일 목요일'));

            expect(day(rendered, '2026년 11월 12일 목요일')).not.toHaveAttribute('data-selected');
        });

        it('does not let days of other months be pressed', () => {
            const rendered = render(<SingleCalendar />);

            const outside = day(rendered, '2026년 12월 1일 화요일');
            expect(outside).toBeDisabled();
            expect(outside).toHaveAttribute('data-outside-month');
        });
    });

    describe('range selection', () => {
        const RangeCalendar = ({ onChange }: { onChange?: (range: CalendarRange) => void }) => {
            const [range, setRange] = useState<CalendarRange>({ start: null, end: null });

            return (
                <Calendar.Root
                    mode="range"
                    defaultMonth={NOV_2026}
                    value={range}
                    onValueChange={(next) => {
                        setRange(next);
                        onChange?.(next);
                    }}
                >
                    <Calendar.Header />
                    <Calendar.Grid />
                </Calendar.Root>
            );
        };

        it('sets the start, then the end, and marks the days between', async () => {
            const onChange = vi.fn();
            const rendered = render(<RangeCalendar onChange={onChange} />);

            await userEvent.click(day(rendered, '2026년 11월 12일 목요일'));
            expect(onChange).toHaveBeenLastCalledWith({ start: new Date(2026, 10, 12), end: null });

            await userEvent.click(day(rendered, '2026년 11월 15일 일요일'));
            expect(onChange).toHaveBeenLastCalledWith({
                start: new Date(2026, 10, 12),
                end: new Date(2026, 10, 15),
            });

            expect(day(rendered, '2026년 11월 12일 목요일')).toHaveAttribute(
                'data-selection-start',
            );
            expect(day(rendered, '2026년 11월 13일 금요일')).toHaveAttribute('data-selected');
            expect(day(rendered, '2026년 11월 13일 금요일')).not.toHaveAttribute(
                'data-selection-start',
            );
            expect(day(rendered, '2026년 11월 15일 일요일')).toHaveAttribute('data-selection-end');
            expect(day(rendered, '2026년 11월 16일 월요일')).not.toHaveAttribute('data-selected');
        });

        it('swaps the ends when the second day comes first', async () => {
            const onChange = vi.fn();
            const rendered = render(<RangeCalendar onChange={onChange} />);

            await userEvent.click(day(rendered, '2026년 11월 20일 금요일'));
            await userEvent.click(day(rendered, '2026년 11월 5일 목요일'));

            expect(onChange).toHaveBeenLastCalledWith({
                start: new Date(2026, 10, 5),
                end: new Date(2026, 10, 20),
            });
        });

        it('starts a new range after a complete one', async () => {
            const onChange = vi.fn();
            const rendered = render(<RangeCalendar onChange={onChange} />);

            await userEvent.click(day(rendered, '2026년 11월 2일 월요일'));
            await userEvent.click(day(rendered, '2026년 11월 4일 수요일'));
            await userEvent.click(day(rendered, '2026년 11월 10일 화요일'));

            expect(onChange).toHaveBeenLastCalledWith({ start: new Date(2026, 10, 10), end: null });
        });

        it('previews the range up to the hovered day while only the start is picked', async () => {
            const rendered = render(<RangeCalendar />);

            await userEvent.click(day(rendered, '2026년 11월 12일 목요일'));
            fireEvent.pointerEnter(day(rendered, '2026년 11월 14일 토요일'));

            expect(day(rendered, '2026년 11월 13일 금요일')).toHaveAttribute('data-selected');
            expect(day(rendered, '2026년 11월 14일 토요일')).toHaveAttribute('data-selection-end');
        });
    });

    describe('keyboard', () => {
        it('puts one day in the tab order and moves focus with arrow keys', async () => {
            const rendered = render(<SingleCalendar defaultValue={new Date(2026, 10, 12)} />);

            const selected = day(rendered, '2026년 11월 12일 목요일');
            expect(selected).toHaveAttribute('tabindex', '0');

            selected.focus();
            await userEvent.keyboard('{ArrowRight}');
            expect(day(rendered, '2026년 11월 13일 금요일')).toHaveFocus();

            await userEvent.keyboard('{ArrowDown}');
            expect(day(rendered, '2026년 11월 20일 금요일')).toHaveFocus();

            await userEvent.keyboard('{Home}');
            expect(day(rendered, '2026년 11월 15일 일요일')).toHaveFocus();

            await userEvent.keyboard('{End}');
            expect(day(rendered, '2026년 11월 21일 토요일')).toHaveFocus();

            await userEvent.keyboard('{Enter}');
            expect(day(rendered, '2026년 11월 21일 토요일')).toHaveAttribute('data-selected');
        });

        it('moves to the next month when focus leaves the shown month', async () => {
            const rendered = render(<SingleCalendar defaultValue={new Date(2026, 10, 30)} />);

            day(rendered, '2026년 11월 30일 월요일').focus();
            await userEvent.keyboard('{ArrowRight}');

            expect(rendered.getByText('2026년 12월')).toBeInTheDocument();
            expect(day(rendered, '2026년 12월 1일 화요일')).toHaveFocus();

            await userEvent.keyboard('{PageUp}');
            expect(rendered.getByText('2026년 11월')).toBeInTheDocument();
            expect(day(rendered, '2026년 11월 1일 일요일')).toHaveFocus();
        });

        it('moves back by day, week, month, and year, and selects with Space', async () => {
            const rendered = render(<SingleCalendar defaultValue={new Date(2026, 10, 12)} />);

            day(rendered, '2026년 11월 12일 목요일').focus();

            await userEvent.keyboard('{ArrowLeft}');
            expect(day(rendered, '2026년 11월 11일 수요일')).toHaveFocus();

            await userEvent.keyboard('{ArrowUp}');
            expect(day(rendered, '2026년 11월 4일 수요일')).toHaveFocus();

            await userEvent.keyboard('{PageDown}');
            expect(rendered.getByText('2026년 12월')).toBeInTheDocument();
            expect(day(rendered, '2026년 12월 4일 금요일')).toHaveFocus();

            await userEvent.keyboard('{Shift>}{PageUp}{/Shift}');
            expect(rendered.getByText('2025년 12월')).toBeInTheDocument();
            expect(day(rendered, '2025년 12월 4일 목요일')).toHaveFocus();

            await userEvent.keyboard(' ');
            expect(day(rendered, '2025년 12월 4일 목요일')).toHaveAttribute('data-selected');
        });
    });

    it('marks today with aria-current', () => {
        const rendered = render(
            <Calendar.Root>
                <Calendar.Grid />
            </Calendar.Root>,
        );

        const today = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'full' }).format(new Date());
        expect(day(rendered, today)).toHaveAttribute('aria-current', 'date');
    });

    it('blocks every day when disabled', () => {
        const rendered = render(<SingleCalendar disabled />);

        expect(day(rendered, '2026년 11월 12일 목요일')).toBeDisabled();
        expect(rendered.getByRole('button', { name: '다음 달' })).toBeDisabled();
    });

    describe('regressions', () => {
        it('does not steal focus from the arrows after a keyboard move onto the same day', async () => {
            const rendered = render(<SingleCalendar defaultValue={new Date(2026, 10, 1)} />);

            day(rendered, '2026년 11월 1일 일요일').focus();
            await userEvent.keyboard('{Home}');

            const next = rendered.getByRole('button', { name: '다음 달' });
            await userEvent.click(next);
            expect(next).toHaveFocus();
        });

        it('moves the tab stop to the pressed day', async () => {
            const rendered = render(<SingleCalendar />);

            await userEvent.click(day(rendered, '2026년 11월 18일 수요일'));

            expect(day(rendered, '2026년 11월 18일 수요일')).toHaveAttribute('tabindex', '0');
        });

        it('keeps the hover preview out of aria-selected and announces that the end is next', async () => {
            const rendered = render(
                <Calendar.Root mode="range" defaultMonth={NOV_2026}>
                    <Calendar.Header />
                    <Calendar.Grid />
                </Calendar.Root>,
            );

            await userEvent.click(day(rendered, '2026년 11월 12일 목요일'));
            fireEvent.pointerEnter(day(rendered, '2026년 11월 14일 토요일'));

            const previewed = day(rendered, '2026년 11월 13일 금요일');
            expect(previewed).toHaveAttribute('data-selected');
            expect(previewed.closest('td')).toHaveAttribute('aria-selected', 'false');
            expect(
                rendered.getByText('시작일을 선택했습니다. 종료일을 선택하세요.'),
            ).toBeInTheDocument();
        });

        it('makes a one-day range when the same day is pressed twice (uncontrolled)', async () => {
            const onValueChange = vi.fn();
            const rendered = render(
                <Calendar.Root mode="range" defaultMonth={NOV_2026} onValueChange={onValueChange}>
                    <Calendar.Grid />
                </Calendar.Root>,
            );

            await userEvent.click(day(rendered, '2026년 11월 12일 목요일'));
            await userEvent.click(day(rendered, '2026년 11월 12일 목요일'));

            expect(onValueChange).toHaveBeenLastCalledWith(
                { start: new Date(2026, 10, 12), end: new Date(2026, 10, 12) },
                expect.anything(),
            );
        });

        it('keeps a range that crosses into the next month', async () => {
            const onValueChange = vi.fn();
            const rendered = render(
                <Calendar.Root mode="range" defaultMonth={NOV_2026} onValueChange={onValueChange}>
                    <Calendar.Header />
                    <Calendar.Grid />
                </Calendar.Root>,
            );

            await userEvent.click(day(rendered, '2026년 11월 28일 토요일'));
            await userEvent.click(rendered.getByRole('button', { name: '다음 달' }));
            await userEvent.click(day(rendered, '2026년 12월 3일 목요일'));

            expect(day(rendered, '2026년 12월 1일 화요일')).toHaveAttribute('data-selected');
            expect(onValueChange).toHaveBeenLastCalledWith(
                { start: new Date(2026, 10, 28), end: new Date(2026, 11, 3) },
                expect.anything(),
            );
        });

        it('jumps a year with Shift+PageDown and respects weekStartsOn for Home', async () => {
            const rendered = render(
                <Calendar.Root
                    defaultMonth={NOV_2026}
                    defaultValue={new Date(2026, 10, 12)}
                    weekStartsOn={1}
                >
                    <Calendar.Header />
                    <Calendar.Grid />
                </Calendar.Root>,
            );

            day(rendered, '2026년 11월 12일 목요일').focus();
            await userEvent.keyboard('{Home}');
            expect(day(rendered, '2026년 11월 9일 월요일')).toHaveFocus();

            await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
            expect(rendered.getByText('2027년 11월')).toBeInTheDocument();
            expect(day(rendered, '2027년 11월 9일 화요일')).toHaveFocus();
        });

        it('labels the grid with the month title', () => {
            const rendered = render(<SingleCalendar />);

            expect(rendered.getByRole('grid', { name: '2026년 11월' })).toBeInTheDocument();
        });
    });

    describe('review follow-ups', () => {
        it('does not crash or warn when mode changes with an uncontrolled value', async () => {
            const error = vi.spyOn(console, 'error').mockImplementation(() => {});
            const rendered = render(
                <Calendar.Root mode="range" defaultMonth={NOV_2026}>
                    <Calendar.Grid />
                </Calendar.Root>,
            );
            await userEvent.click(day(rendered, '2026년 11월 12일 목요일'));

            rendered.rerender(
                <Calendar.Root mode="single" defaultMonth={NOV_2026}>
                    <Calendar.Grid />
                </Calendar.Root>,
            );

            expect(rendered.getByRole('grid')).toBeInTheDocument();
            expect(error).not.toHaveBeenCalled();
            error.mockRestore();
        });

        it('marks the grid multiselectable only in range mode', () => {
            const rendered = render(
                <Calendar.Root mode="range" defaultMonth={NOV_2026}>
                    <Calendar.Grid />
                </Calendar.Root>,
            );

            expect(rendered.getByRole('grid')).toHaveAttribute('aria-multiselectable', 'true');
        });

        it('keeps Gregorian labels for a locale with another calendar', () => {
            const rendered = render(
                <Calendar.Root locale="ko-KR-u-ca-islamic" defaultMonth={NOV_2026}>
                    <Calendar.Header />
                    <Calendar.Grid />
                </Calendar.Root>,
            );

            expect(rendered.getByText('2026년 11월')).toBeInTheDocument();
        });

        it('dims and blocks a single day disabled through a custom renderer', async () => {
            const onValueChange = vi.fn();
            const rendered = render(
                <Calendar.Root defaultMonth={NOV_2026} onValueChange={onValueChange}>
                    <Calendar.Grid>
                        {(date) => (
                            <Calendar.DayPrimitive date={date} disabled={date.getDate() === 15} />
                        )}
                    </Calendar.Grid>
                </Calendar.Root>,
            );

            const blocked = day(rendered, '2026년 11월 15일 일요일');
            expect(blocked).toHaveAttribute('data-disabled');
            await userEvent.click(blocked);
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it('announces the selected day, but not a canceled change', async () => {
            const rendered = render(
                <SingleCalendar
                    onValueChange={(value, details) => {
                        if (value?.getDate() === 13) details.cancel();
                    }}
                />,
            );

            await userEvent.click(day(rendered, '2026년 11월 12일 목요일'));
            expect(
                rendered.getByText('2026년 11월 12일 목요일을 선택했습니다.'),
            ).toBeInTheDocument();

            await userEvent.click(day(rendered, '2026년 11월 13일 금요일'));
            expect(rendered.queryByText(/13일 금요일을 선택했습니다/)).not.toBeInTheDocument();
        });

        it('announces a controlled selection only once the parent takes the value', async () => {
            const Controlled = ({ value }: { value: Date | null }) => (
                <Calendar.Root defaultMonth={NOV_2026} value={value} onValueChange={() => {}}>
                    <Calendar.Grid />
                </Calendar.Root>
            );
            const rendered = render(<Controlled value={null} />);

            await userEvent.click(day(rendered, '2026년 11월 12일 목요일'));
            expect(rendered.queryByText(/12일 목요일을 선택했습니다/)).not.toBeInTheDocument();

            rendered.rerender(<Controlled value={new Date(2026, 10, 12)} />);
            expect(
                rendered.getByText('2026년 11월 12일 목요일을 선택했습니다.'),
            ).toBeInTheDocument();
        });

        it('announces the selected range', async () => {
            const rendered = render(
                <Calendar.Root mode="range" defaultMonth={NOV_2026}>
                    <Calendar.Grid />
                </Calendar.Root>,
            );

            await userEvent.click(day(rendered, '2026년 11월 15일 일요일'));
            await userEvent.click(day(rendered, '2026년 11월 12일 목요일'));

            expect(
                rendered.getByText(
                    '2026년 11월 12일 목요일부터 2026년 11월 15일 일요일까지 선택했습니다.',
                ),
            ).toBeInTheDocument();
        });

        it('shows the month of a controlled value set from outside', async () => {
            const Controlled = ({ value }: { value: Date }) => (
                <Calendar.Root value={value}>
                    <Calendar.Header />
                    <Calendar.Grid />
                </Calendar.Root>
            );
            const rendered = render(<Controlled value={new Date(2026, 10, 12)} />);

            rendered.rerender(<Controlled value={new Date(2027, 2, 3)} />);
            expect(rendered.getByRole('grid', { name: '2027년 3월' })).toBeInTheDocument();
            expect(day(rendered, '2027년 3월 3일 수요일')).toHaveAttribute('tabindex', '0');

            await userEvent.click(rendered.getByRole('button', { name: '다음 달' }));
            rendered.rerender(<Controlled value={new Date(2027, 2, 3)} />);
            expect(rendered.getByRole('grid', { name: '2027년 4월' })).toBeInTheDocument();
        });

        it('lets the keyboard reach and pass a day disabled through a custom renderer', async () => {
            const onValueChange = vi.fn();
            const rendered = render(
                <Calendar.Root
                    defaultMonth={NOV_2026}
                    defaultValue={new Date(2026, 10, 14)}
                    onValueChange={onValueChange}
                >
                    <Calendar.Grid>
                        {(date) => (
                            <Calendar.DayPrimitive date={date} disabled={date.getDate() === 15} />
                        )}
                    </Calendar.Grid>
                </Calendar.Root>,
            );

            day(rendered, '2026년 11월 14일 토요일').focus();
            await userEvent.keyboard('{ArrowRight}');

            const blocked = day(rendered, '2026년 11월 15일 일요일');
            expect(blocked).toHaveFocus();
            expect(blocked).toHaveAttribute('aria-disabled', 'true');
            expect(blocked).toHaveAttribute('tabindex', '0');

            await userEvent.keyboard('{Enter}');
            expect(onValueChange).not.toHaveBeenCalled();

            await userEvent.keyboard('{ArrowRight}');
            expect(day(rendered, '2026년 11월 16일 월요일')).toHaveFocus();
        });

        it('treats an invalid Date as no value instead of crashing', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const single = render(
                <Calendar.Root value={new Date('not a date')} defaultMonth={NOV_2026}>
                    <Calendar.Header />
                    <Calendar.Grid />
                </Calendar.Root>,
            );
            expect(single.getByRole('grid', { name: '2026년 11월' })).toBeInTheDocument();
            expect(single.container.querySelector('[data-selected]')).toBeNull();
            single.unmount();

            const range = render(
                <Calendar.Root
                    mode="range"
                    defaultMonth={new Date(NaN)}
                    defaultValue={{ start: new Date(2026, 10, 5), end: new Date(NaN) }}
                >
                    <Calendar.Header />
                    <Calendar.Grid />
                </Calendar.Root>,
            );
            expect(range.getByRole('grid', { name: '2026년 11월' })).toBeInTheDocument();
            expect(day(range, '2026년 11월 5일 목요일')).toHaveAttribute('data-selection-start');
            expect(
                range.getByText('시작일을 선택했습니다. 종료일을 선택하세요.'),
            ).toBeInTheDocument();
            range.unmount();

            const emptyRange = render(
                <Calendar.Root mode="range" defaultValue={{ start: new Date(NaN), end: null }}>
                    <Calendar.Grid />
                </Calendar.Root>,
            );
            expect(emptyRange.container.querySelector('[data-selected]')).toBeNull();
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('invalid Date'));
            warn.mockRestore();
        });
    });
});
