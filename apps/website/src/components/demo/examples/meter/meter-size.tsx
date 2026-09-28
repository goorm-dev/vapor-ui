import { Meter, VStack } from '@vapor-ui/core';

export default function MeterSize() {
    return (
        <VStack $css={{ gap: '$300', width: '100%', maxWidth: '20rem' }}>
            {(['sm', 'md', 'lg'] as const).map((size) => (
                <Meter.Root key={size} size={size} value={42}>
                    <Meter.Label>저장 공간 ({size})</Meter.Label>
                    <Meter.Value />
                    <Meter.Track />
                </Meter.Root>
            ))}
        </VStack>
    );
}
