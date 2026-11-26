import { useState } from 'react';

import { Calendar, Text, VStack } from '@vapor-ui/core';

export default function CalendarControlled() {
    const [date, setDate] = useState<Date | null>(null);

    return (
        <VStack $css={{ gap: '$100' }}>
            <Calendar.Root value={date} onValueChange={setDate}>
                <Calendar.Header />
                <Calendar.Grid />
            </Calendar.Root>
            <Text typography="body2">
                선택한 날짜: {date ? date.toLocaleDateString('ko-KR') : '없음'}
            </Text>
        </VStack>
    );
}
