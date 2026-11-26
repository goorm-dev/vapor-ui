import { useState } from 'react';

import { Calendar } from '@vapor-ui/core';
import type { CalendarRange } from '@vapor-ui/core';

export default function CalendarRangeDemo() {
    const [range, setRange] = useState<CalendarRange>({ start: null, end: null });

    return (
        <Calendar.Root mode="range" value={range} onValueChange={setRange}>
            <Calendar.Header />
            <Calendar.Grid />
        </Calendar.Root>
    );
}
