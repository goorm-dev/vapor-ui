import { Popover } from '@base-ui/react';

export const Component = ({ shouldTrack }: { shouldTrack: boolean }) => (
    <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Positioner trackAnchor={shouldTrack}>
            <Popover.Popup>Content</Popover.Popup>
        </Popover.Positioner>
    </Popover.Root>
);
