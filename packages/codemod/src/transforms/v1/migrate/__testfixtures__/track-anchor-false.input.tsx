import { Popover } from '@vapor-ui/core';

export const Component = () => (
    <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.PositionerPrimitive trackAnchor={false}>
            <Popover.Popup>Content</Popover.Popup>
        </Popover.PositionerPrimitive>
    </Popover.Root>
);
