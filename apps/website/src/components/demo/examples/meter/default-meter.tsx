import { Meter } from '@vapor-ui/core';

export default function DefaultMeter() {
    return (
        <Meter.Root value={42} $css={{ maxWidth: '20rem' }}>
            <Meter.Label>저장 공간</Meter.Label>
            <Meter.Value />
            <Meter.Track />
        </Meter.Root>
    );
}
