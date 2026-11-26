import { Calendar } from '@vapor-ui/core';

export default function DefaultCalendar() {
    return (
        <Calendar.Root>
            <Calendar.Header />
            <Calendar.Grid />
        </Calendar.Root>
    );
}
