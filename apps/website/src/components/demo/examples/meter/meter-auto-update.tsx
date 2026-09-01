import { useEffect, useState } from 'react';

import { Button, Meter, VStack } from '@vapor-ui/core';

export default function MeterAutoUpdate() {
    const [value, setValue] = useState(42);
    const [running, setRunning] = useState(true);

    useEffect(() => {
        if (!running) return;

        // 1초 간격 — 초당 3회를 넘기지 않는다.
        const id = setInterval(() => setValue((prev) => (prev + 7) % 101), 1000);

        return () => clearInterval(id);
    }, [running]);

    return (
        <VStack $css={{ gap: '$200', width: '100%', maxWidth: '20rem' }}>
            <Meter.Root value={value}>
                <Meter.Label>CPU 사용률</Meter.Label>
                <Meter.Value />
                <Meter.Track />
            </Meter.Root>

            <Button variant="outline" size="sm" onClick={() => setRunning((prev) => !prev)}>
                {running ? '갱신 일시정지' : '갱신 재개'}
            </Button>
        </VStack>
    );
}
