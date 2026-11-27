import { Calendar } from '@vapor-ui/core';

export default function CalendarLocale() {
    return (
        <Calendar.Root locale="en-US" weekStartsOn={1}>
            <Calendar.Header />
            <Calendar.Grid />
        </Calendar.Root>
    );
}
