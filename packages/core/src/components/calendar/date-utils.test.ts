import { addMonths, getWeeks } from './date-utils';

const NOV_2026 = new Date(2026, 10, 1);

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
