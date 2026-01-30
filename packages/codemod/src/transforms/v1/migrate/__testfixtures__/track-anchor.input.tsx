import { Popover } from '@vapor-ui/core';

export const Component = ({ shouldTrack }: { shouldTrack: boolean }) => (
    <>
        {/* true */}
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.PositionerPrimitive trackAnchor={true}>
                <Popover.Popup>Content</Popover.Popup>
            </Popover.PositionerPrimitive>
        </Popover.Root>
        {/* false */}
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.PositionerPrimitive trackAnchor={false}>
                <Popover.Popup>Content</Popover.Popup>
            </Popover.PositionerPrimitive>
        </Popover.Root>
        {/* shorthand */}
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.PositionerPrimitive trackAnchor>
                <Popover.Popup>Content</Popover.Popup>
            </Popover.PositionerPrimitive>
        </Popover.Root>
        {/* expression */}
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.PositionerPrimitive trackAnchor={shouldTrack}>
                <Popover.Popup>Content</Popover.Popup>
            </Popover.PositionerPrimitive>
        </Popover.Root>
    </>
);
