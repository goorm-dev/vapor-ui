import { Popover } from '@vapor-ui/core';

export const Component = ({ shouldTrack }: { shouldTrack: boolean }) => (
    <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.PositionerPrimitive trackAnchor={shouldTrack}>
            <Popover.Popup>Content</Popover.Popup>
        </Popover.PositionerPrimitive>
    </Popover.Root>
);
