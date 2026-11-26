'use client';

import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { ChevronLeftOutlineIcon, ChevronRightOutlineIcon } from '@vapor-ui/icons';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import type { MakeChangeEventDetails } from '~/utils/create-event-details';
import { createChangeEventDetails } from '~/utils/create-event-details';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { IconButton } from '../icon-button';
import * as styles from './calendar.css';
import {
    addDays,
    addMonths,
    compareDay,
    getStartOfWeek,
    getWeeks,
    isSameDay,
    isSameMonth,
    startOfDay,
    startOfMonth,
} from './date-utils';

const [CalendarProvider, useCalendarContext] = createContext<CalendarContext>({
    name: 'Calendar',
    hookName: 'useCalendarContext',
    providerName: 'CalendarProvider',
});

const EMPTY_RANGE: CalendarRange = { start: null, end: null };

/** Korean defaults; any other locale falls back to its English-like label. */
const navigationLabel = (locale: string, direction: 'previous' | 'next') => {
    const korean = locale.startsWith('ko');
    if (direction === 'previous') return korean ? '이전 달' : 'Previous month';
    return korean ? '다음 달' : 'Next month';
};

/* -------------------------------------------------------------------------------------------------
 * Calendar.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the Calendar compound component, a month view for picking one date or a range of dates. Holds the selected value, the shown month, and the keyboard focus, and passes them to `Calendar.Header` and `Calendar.Grid`. Renders a `<div>` element.
 */
export const CalendarRoot = forwardRef<HTMLDivElement, CalendarRoot.Props>((props, ref) => {
    const {
        render,
        className,
        mode = 'single',
        value: valueProp,
        defaultValue,
        onValueChange: onValueChangeProp,
        defaultMonth,
        locale = 'ko-KR',
        weekStartsOn = 0,
        disabled = false,
        ...componentProps
    } = resolveStyles(props as CalendarRootBaseProps & CalendarSelectionProps);

    const [value, setValueUnwrapped] = useControlled<CalendarValue>({
        controlled: valueProp,
        default: defaultValue ?? (mode === 'range' ? EMPTY_RANGE : null),
        name: 'Calendar',
        state: 'value',
    });

    const onValueChange = useStableCallback(onValueChangeProp as CalendarValueChangeHandler);

    const setValue = useStableCallback(
        (nextValue: CalendarValue, eventDetails: CalendarRoot.ChangeEventDetails) => {
            onValueChange?.(nextValue, eventDetails);
            if (eventDetails.isCanceled) return;
            setValueUnwrapped(nextValue);
        },
    );

    const anchorDate = mode === 'range' ? (value as CalendarRange | null)?.start : (value as Date);
    const [today] = useState(() => startOfDay(new Date()));
    const [month, setMonth] = useState(() => startOfMonth(defaultMonth ?? anchorDate ?? today));
    const [focusedDate, setFocusedDate] = useState(() => {
        const preferred = anchorDate ?? today;
        return isSameMonth(preferred, month) ? startOfDay(preferred) : month;
    });
    const [previewDate, setPreviewDate] = useState<Date | null>(null);

    const shouldFocusRef = useRef(false);

    const moveFocus = useStableCallback((date: Date) => {
        shouldFocusRef.current = true;
        setFocusedDate(date);
        if (!isSameMonth(date, month)) setMonth(startOfMonth(date));
    });

    const changeMonth = useStableCallback((amount: number) => {
        setMonth((current) => addMonths(current, amount));
        setFocusedDate((current) => addMonths(current, amount));
    });

    const select = useStableCallback((date: Date, event: Event) => {
        const details = createChangeEventDetails('day-press', event);

        if (mode === 'single') {
            setValue(date, details);
            return;
        }

        const range = (value as CalendarRange | null) ?? EMPTY_RANGE;

        if (!range.start || range.end) {
            setValue({ start: date, end: null }, details);
            return;
        }

        // A second press closes the range; pressing an earlier day swaps the ends.
        const [start, end] =
            compareDay(date, range.start) < 0 ? [date, range.start] : [range.start, date];
        setValue({ start, end }, details);
    });

    const state: CalendarRoot.State = useMemo(() => ({ disabled }), [disabled]);

    const element = useRenderElement({
        ref,
        render,
        state,
        props: {
            className: cn(styles.root, className),
            'data-disabled': disabled ? '' : undefined,
            ...componentProps,
        },
    });

    const context: CalendarContext = useMemo(
        () => ({
            mode,
            value,
            select,
            month,
            changeMonth,
            focusedDate,
            moveFocus,
            shouldFocusRef,
            previewDate,
            setPreviewDate,
            today,
            locale,
            weekStartsOn,
            disabled,
        }),
        [
            mode,
            value,
            select,
            month,
            changeMonth,
            focusedDate,
            moveFocus,
            previewDate,
            today,
            locale,
            weekStartsOn,
            disabled,
        ],
    );

    return <CalendarProvider value={context}>{element}</CalendarProvider>;
});
CalendarRoot.displayName = 'Calendar.Root';

/* -------------------------------------------------------------------------------------------------
 * Calendar.Header
 * -----------------------------------------------------------------------------------------------*/

/**
 * Row above the grid with the previous-month button, the month title, and the next-month button. Pass children to arrange `Calendar.PreviousPrimitive`, `Calendar.TitlePrimitive`, and `Calendar.NextPrimitive` yourself. Renders a `<div>` element.
 */
export const CalendarHeader = forwardRef<HTMLDivElement, CalendarHeader.Props>((props, ref) => {
    const { render, className, children, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        props: {
            className: cn(styles.header, className),
            children: children ?? (
                <>
                    <CalendarPreviousPrimitive />
                    <CalendarTitlePrimitive />
                    <CalendarNextPrimitive />
                </>
            ),
            ...componentProps,
        },
    });
});
CalendarHeader.displayName = 'Calendar.Header';

/* -------------------------------------------------------------------------------------------------
 * Calendar.PreviousPrimitive / Calendar.NextPrimitive
 * -----------------------------------------------------------------------------------------------*/

const createNavigationButton = (direction: 'previous' | 'next') => {
    const Component = forwardRef<HTMLElement, CalendarPreviousPrimitive.Props>((props, ref) => {
        const { children, ...componentProps } = props;
        const { changeMonth, locale, disabled } = useCalendarContext();

        const handleClick: IconButton.Props['onClick'] = (event) => {
            componentProps.onClick?.(event);
            changeMonth(direction === 'previous' ? -1 : 1);
        };

        return (
            <IconButton
                ref={ref}
                size="lg"
                variant="ghost"
                colorPalette="secondary"
                aria-label={navigationLabel(locale, direction)}
                disabled={disabled}
                {...componentProps}
                onClick={handleClick}
            >
                {children ??
                    (direction === 'previous' ? (
                        <ChevronLeftOutlineIcon />
                    ) : (
                        <ChevronRightOutlineIcon />
                    ))}
            </IconButton>
        );
    });

    return Component;
};

/**
 * Button that shows the previous month. Its accessible name defaults to "이전 달" for Korean locales and "Previous month" otherwise. Renders a `<button>` element.
 */
export const CalendarPreviousPrimitive = createNavigationButton('previous');
CalendarPreviousPrimitive.displayName = 'Calendar.PreviousPrimitive';

/**
 * Button that shows the next month. Its accessible name defaults to "다음 달" for Korean locales and "Next month" otherwise. Renders a `<button>` element.
 */
export const CalendarNextPrimitive = createNavigationButton('next');
CalendarNextPrimitive.displayName = 'Calendar.NextPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Calendar.TitlePrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Title of the shown month, such as "2026년 11월", formatted with the `locale` of `Calendar.Root`. Screen readers announce it when the month changes. Renders a `<div>` element.
 */
export const CalendarTitlePrimitive = forwardRef<HTMLDivElement, CalendarTitlePrimitive.Props>(
    (props, ref) => {
        const { render, className, ...componentProps } = resolveStyles(props);
        const { month, locale } = useCalendarContext();

        const title = useMemo(
            () => new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(month),
            [locale, month],
        );

        return useRenderElement({
            ref,
            render,
            props: {
                'aria-live': 'polite',
                className: cn(styles.title, className),
                children: title,
                ...componentProps,
            },
        });
    },
);
CalendarTitlePrimitive.displayName = 'Calendar.TitlePrimitive';

/* -------------------------------------------------------------------------------------------------
 * Calendar.Grid
 * -----------------------------------------------------------------------------------------------*/

/**
 * Grid of the shown month: a row of weekday names, then six weeks of day buttons. Arrow keys, Home, End, PageUp, and PageDown move the focus between days. Pass a function as children to render each day yourself, usually with `Calendar.DayPrimitive`. Renders a `<table>` element.
 */
export const CalendarGrid = forwardRef<HTMLTableElement, CalendarGrid.Props>((props, ref) => {
    const { render, className, children, ...componentProps } = resolveStyles(props);
    const { month, locale, weekStartsOn, setPreviewDate } = useCalendarContext();

    const weeks = useMemo(() => getWeeks(month, weekStartsOn), [month, weekStartsOn]);
    const weekdays = useMemo(() => {
        const short = new Intl.DateTimeFormat(locale, { weekday: 'short' });
        const long = new Intl.DateTimeFormat(locale, { weekday: 'long' });
        return weeks[0].map((date) => ({ short: short.format(date), long: long.format(date) }));
    }, [weeks, locale]);

    const renderDay = children ?? ((date: Date) => <CalendarDayPrimitive date={date} />);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'table',
        props: {
            role: 'grid',
            className: cn(styles.grid, className),
            onPointerLeave: () => setPreviewDate(null),
            children: (
                <>
                    <thead>
                        <tr className={styles.weekdays}>
                            {weekdays.map(({ short, long }) => (
                                <th key={long} scope="col" abbr={long} className={styles.weekday}>
                                    {short}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map((week) => (
                            <tr key={week[0].getTime()}>
                                {week.map((date) => (
                                    <CalendarCell key={date.getTime()} date={date}>
                                        {renderDay(date)}
                                    </CalendarCell>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </>
            ),
            ...componentProps,
        },
    });
});
CalendarGrid.displayName = 'Calendar.Grid';

/** `gridcell` that carries `aria-selected`, which is not allowed on the button inside it. */
const CalendarCell = ({ date, children }: { date: Date; children: ReactNode }) => {
    const { selected, outsideMonth } = useDayState(date);

    return (
        <td
            role="gridcell"
            aria-selected={outsideMonth ? undefined : selected}
            className={styles.cell}
        >
            {children}
        </td>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Calendar.DayPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button for one day in `Calendar.Grid`. Selects the day when pressed. Days of the previous and next month are shown dimmed and can't be pressed. Its accessible name is the full date, such as "2026년 11월 26일 목요일". Renders a `<button>` element.
 */
export const CalendarDayPrimitive = forwardRef<HTMLButtonElement, CalendarDayPrimitive.Props>(
    (props, ref) => {
        const { date, render, className, ...componentProps } = resolveStyles(props);
        const context = useCalendarContext();
        const { focusedDate, moveFocus, shouldFocusRef, select, setPreviewDate, locale, mode } =
            context;
        const weekStartsOn = context.weekStartsOn;

        const state = useDayState(date);
        const { outsideMonth, disabled } = state;
        const focused = isSameDay(date, focusedDate) && !outsideMonth;

        const buttonRef = useRef<HTMLButtonElement | null>(null);
        useEffect(() => {
            if (focused && shouldFocusRef.current) {
                shouldFocusRef.current = false;
                buttonRef.current?.focus();
            }
        }, [focused, shouldFocusRef]);

        const label = useMemo(
            () => new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date),
            [locale, date],
        );

        const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
            componentProps.onClick?.(event);
            select(startOfDay(date), event.nativeEvent);
        };

        const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
            componentProps.onKeyDown?.(event);

            const next = getKeyboardTarget(event, date, weekStartsOn);
            if (!next) return;

            event.preventDefault();
            moveFocus(next);
            if (mode === 'range') setPreviewDate(next);
        };

        const showPreview = () => {
            if (mode === 'range' && !outsideMonth) setPreviewDate(startOfDay(date));
        };

        return useRenderElement({
            ref: [ref, buttonRef],
            render,
            defaultTagName: 'button',
            state,
            props: {
                type: 'button',
                tabIndex: focused ? 0 : -1,
                disabled: outsideMonth || disabled,
                'aria-label': label,
                'aria-current': state.current ? 'date' : undefined,
                className: cn(styles.day, className),
                children: date.getDate(),
                ...dataAttributes(state),
                ...componentProps,
                onClick: handleClick,
                onKeyDown: handleKeyDown,
                onPointerEnter: showPreview,
                onFocus: showPreview,
            },
        });
    },
);
CalendarDayPrimitive.displayName = 'Calendar.DayPrimitive';

const dataAttributes = (state: CalendarDayPrimitive.State) => ({
    'data-selected': state.selected ? '' : undefined,
    'data-selection-start': state.selectionStart ? '' : undefined,
    'data-selection-end': state.selectionEnd ? '' : undefined,
    'data-current': state.current ? '' : undefined,
    'data-outside-month': state.outsideMonth ? '' : undefined,
    'data-disabled': state.disabled ? '' : undefined,
});

const getKeyboardTarget = (event: KeyboardEvent, date: Date, weekStartsOn: number) => {
    switch (event.key) {
        case 'ArrowLeft':
            return addDays(date, -1);
        case 'ArrowRight':
            return addDays(date, 1);
        case 'ArrowUp':
            return addDays(date, -7);
        case 'ArrowDown':
            return addDays(date, 7);
        case 'Home':
            return getStartOfWeek(date, weekStartsOn);
        case 'End':
            return addDays(getStartOfWeek(date, weekStartsOn), 6);
        case 'PageUp':
            return addMonths(date, event.shiftKey ? -12 : -1);
        case 'PageDown':
            return addMonths(date, event.shiftKey ? 12 : 1);
        default:
            return null;
    }
};

/**
 * Works out how one day looks: selected, inside a range (including the hover or focus preview while only the start is picked), today, or outside the shown month.
 */
const useDayState = (date: Date): CalendarDayPrimitive.State => {
    const { mode, value, previewDate, month, today, disabled } = useCalendarContext();

    const outsideMonth = !isSameMonth(date, month);
    const base = {
        current: isSameDay(date, today),
        outsideMonth,
        disabled,
        selected: false,
        selectionStart: false,
        selectionEnd: false,
    };

    if (outsideMonth) return base;

    // A single selection is drawn as a range that starts and ends on the same day.
    if (mode === 'single') {
        const selected = isSameDay(value as Date | null, date);
        return { ...base, selected, selectionStart: selected, selectionEnd: selected };
    }

    const range = (value as CalendarRange | null) ?? EMPTY_RANGE;
    if (!range.start) return base;

    const otherEnd = range.end ?? previewDate ?? range.start;
    const [start, end] =
        compareDay(otherEnd, range.start) < 0 ? [otherEnd, range.start] : [range.start, otherEnd];

    return {
        ...base,
        selected: compareDay(date, start) >= 0 && compareDay(date, end) <= 0,
        selectionStart: isSameDay(date, start),
        selectionEnd: isSameDay(date, end),
    };
};

/* -----------------------------------------------------------------------------------------------*/

type CalendarValue = Date | CalendarRange | null;
type CalendarValueChangeHandler = (
    value: CalendarValue,
    eventDetails: CalendarRoot.ChangeEventDetails,
) => void;

export interface CalendarRange {
    /** First day of the range, or `null` before any day is picked. */
    start: Date | null;
    /** Last day of the range, or `null` while only the first day is picked. */
    end: Date | null;
}

interface CalendarContext {
    mode: 'single' | 'range';
    value: CalendarValue;
    select: (date: Date, event: Event) => void;
    month: Date;
    changeMonth: (amount: number) => void;
    focusedDate: Date;
    moveFocus: (date: Date) => void;
    shouldFocusRef: { current: boolean };
    previewDate: Date | null;
    setPreviewDate: (date: Date | null) => void;
    today: Date;
    locale: string;
    weekStartsOn: number;
    disabled: boolean;
}

export interface CalendarRootBaseProps extends Omit<
    VaporUIComponentProps<'div', CalendarRoot.State>,
    'defaultValue'
> {
    /**
     * Month shown on first render. Defaults to the month of the selected value, or the current month.
     */
    defaultMonth?: Date;
    /**
     * BCP 47 locale used for the month title, weekday names, and day labels.
     * @default 'ko-KR'
     */
    locale?: string;
    /**
     * First day of the week, from `0` (Sunday) to `6` (Saturday).
     * @default 0
     */
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    /**
     * Disables the calendar, blocking day selection and month navigation.
     * @default false
     */
    disabled?: boolean;
}

export interface CalendarSingleProps {
    /**
     * `single` picks one day. `range` picks a first and a last day: the first press sets `start`, the second sets `end` (swapping them if needed), and the next press starts a new range.
     * @default 'single'
     */
    mode?: 'single';
    /** Selected day, or `{ start, end }` when `mode` is `range`. Use when the component is controlled. */
    value?: Date | null;
    /** Day, or `{ start, end }` when `mode` is `range`, selected on first render. Use when the component is not controlled. */
    defaultValue?: Date | null;
    /** Called when a day is pressed, with the new day, or the new `{ start, end }` when `mode` is `range`. Call `eventDetails.cancel()` to keep the current value. */
    onValueChange?: (value: Date | null, eventDetails: CalendarRoot.ChangeEventDetails) => void;
}

export interface CalendarRangeProps {
    /**
     * `single` picks one day. `range` picks a first and a last day: the first press sets `start`, the second sets `end` (swapping them if needed), and the next press starts a new range.
     */
    mode: 'range';
    /** Selected day, or `{ start, end }` when `mode` is `range`. Use when the component is controlled. */
    value?: CalendarRange;
    /** Day, or `{ start, end }` when `mode` is `range`, selected on first render. Use when the component is not controlled. */
    defaultValue?: CalendarRange;
    /** Called when a day is pressed, with the new day, or the new `{ start, end }` when `mode` is `range`. Call `eventDetails.cancel()` to keep the current value. */
    onValueChange?: (value: CalendarRange, eventDetails: CalendarRoot.ChangeEventDetails) => void;
}

type CalendarSelectionProps = CalendarSingleProps | CalendarRangeProps;

export namespace CalendarRoot {
    export interface State {
        [key: string]: unknown;
        /** Whether the calendar ignores user interaction. */
        disabled: boolean;
    }
    export type Props = CalendarRootBaseProps & CalendarSelectionProps;
    export type ChangeEventReason = 'day-press';
    export type ChangeEventDetails = MakeChangeEventDetails<ChangeEventReason>;
}

export namespace CalendarHeader {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}

export namespace CalendarPreviousPrimitive {
    export type State = IconButton.State;
    export type Props = Partial<IconButton.Props>;
}

export namespace CalendarNextPrimitive {
    export type State = CalendarPreviousPrimitive.State;
    export type Props = CalendarPreviousPrimitive.Props;
}

export namespace CalendarTitlePrimitive {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}

export namespace CalendarGrid {
    export type State = {};
    export interface Props extends Omit<VaporUIComponentProps<'table', State>, 'children'> {
        /** Renders one day of the grid. Defaults to `Calendar.DayPrimitive`. */
        children?: (date: Date) => ReactNode;
    }
}

export namespace CalendarDayPrimitive {
    export interface State {
        [key: string]: unknown;
        /** Whether the day is selected: the selected day, or any day of the selected range. */
        selected: boolean;
        /** Whether the day is the first selected day. A single selection is both the start and the end. */
        selectionStart: boolean;
        /** Whether the day is the last selected day. */
        selectionEnd: boolean;
        /** Whether the day is today. */
        current: boolean;
        /** Whether the day belongs to the previous or the next month. */
        outsideMonth: boolean;
        /** Whether the calendar is disabled. */
        disabled: boolean;
    }
    export interface Props extends VaporUIComponentProps<'button', State> {
        /** Day this button selects. */
        date: Date;
    }
}
