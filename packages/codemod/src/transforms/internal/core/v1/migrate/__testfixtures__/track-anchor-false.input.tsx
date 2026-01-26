import { Popover } from '@base-ui/react';

export const Component = () => (
    <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Positioner trackAnchor={false}>
            <Popover.Popup>Content</Popover.Popup>
        </Popover.Positioner>
    </Popover.Root>
);
