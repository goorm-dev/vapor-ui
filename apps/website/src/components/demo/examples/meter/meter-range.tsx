import { Meter } from '@vapor-ui/core';

export default function MeterRange() {
    return (
        <Meter.Root
            value={4.2}
            max={8}
            format={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }}
            getAriaValueText={(formattedValue) => `8GB 중 ${formattedValue} 사용`}
            $css={{ maxWidth: '20rem' }}
        >
            <Meter.Label>저장 공간</Meter.Label>
            <Meter.Value />
            <Meter.Track />
        </Meter.Root>
    );
}
