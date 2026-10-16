import { Meter, VStack } from '@vapor-ui/core';

export default function MeterType() {
    return (
        <VStack $css={{ gap: '$300', width: '100%', maxWidth: '20rem' }}>
            <Meter.Root value={42}>
                <Meter.Label>저장 공간</Meter.Label>
                <Meter.Value />
                <Meter.Track />
            </Meter.Root>

            <Meter.Root type="warning" value={92}>
                <Meter.Label>저장 공간 부족</Meter.Label>
                <Meter.Value />
                <Meter.Track />
            </Meter.Root>
        </VStack>
    );
}
