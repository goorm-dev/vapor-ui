// Day arithmetic goes through `new Date(y, m, d + n)` instead of adding milliseconds,
// so a daylight-saving shift never skips or repeats a day.

export const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const addDays = (date: Date, amount: number) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

/**
 * Moves by whole months and clamps to the last day of the target month, so Jan 31 + 1 month is Feb 28 (or 29).
 */
export const addMonths = (date: Date, amount: number) => {
    const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();

    return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
};

export const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

export const isSameMonth = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/**

 * Negative when `a` is an earlier day than `b`, ignoring the time of day.

 */
export const compareDay = (a: Date, b: Date) => startOfDay(a).getTime() - startOfDay(b).getTime();

/**
 * Six fixed weeks covering the month of `month`, so the grid height never jumps between months.
 * `weekStartsOn` is 0 for Sunday through 6 for Saturday.
 */
export const getWeeks = (month: Date, weekStartsOn: number) => {
    const start = getStartOfWeek(startOfMonth(month), weekStartsOn);

    return Array.from({ length: 6 }, (_, week) =>
        Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)),
    );
};

export const getStartOfWeek = (date: Date, weekStartsOn: number) =>
    addDays(date, -((date.getDay() - weekStartsOn + 7) % 7));
