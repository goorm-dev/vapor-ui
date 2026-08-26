import { Meter, VStack } from '@vapor-ui/core';

export default function MeterSize() {
    return (
        <VStack $css={{ gap: '$300', width: '20rem' }}>
            {(['sm', 'md', 'lg'] as const).map((size) => (
                <Meter.Root key={size} size={size} value={42}>
                    <Meter.Label>{size}</Meter.Label>
                    <Meter.Value />
                    <Meter.Track>
                        <Meter.Indicator />
                    </Meter.Track>
                </Meter.Root>
            ))}
        </VStack>
    );
}
