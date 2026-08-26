import { Meter, VStack } from '@vapor-ui/core';

export default function MeterVariant() {
    return (
        <VStack $css={{ gap: '$300', width: '20rem' }}>
            <Meter.Root value={42}>
                <Meter.Label>저장 공간</Meter.Label>
                <Meter.Value />
                <Meter.Track>
                    <Meter.Indicator />
                </Meter.Track>
            </Meter.Root>

            <Meter.Root variant="warning" value={92}>
                <Meter.Label>저장 공간 부족</Meter.Label>
                <Meter.Value />
                <Meter.Track>
                    <Meter.Indicator />
                </Meter.Track>
            </Meter.Root>
        </VStack>
    );
}
