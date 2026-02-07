// @ts-nocheck
import { Menu, Popover, Tooltip } from '@vapor-ui/core';

export const Component = () => (
    <>
        {/* Menu with openOnHover */}
        <Menu.Root>
            <Menu.Trigger openOnHover>Open</Menu.Trigger>
            <Menu.Popup>Content</Menu.Popup>
        </Menu.Root>
        {/* Menu with delay and closeDelay */}
        <Menu.Root>
            <Menu.Trigger openOnHover delay={200} closeDelay={100}>
                Open
            </Menu.Trigger>
            <Menu.Popup>Content</Menu.Popup>
        </Menu.Root>
        {/* Popover with openOnHover */}
        <Popover.Root>
            <Popover.Trigger openOnHover>Open</Popover.Trigger>
            <Popover.Popup>Content</Popover.Popup>
        </Popover.Root>
        {/* Popover with all props */}
        <Popover.Root>
            <Popover.Trigger openOnHover delay={300} closeDelay={150}>
                Open
            </Popover.Trigger>
            <Popover.Popup>Content</Popover.Popup>
        </Popover.Root>
        {/* Tooltip with delay only */}
        <Tooltip.Root>
            <Tooltip.Trigger delay={500}>Hover me</Tooltip.Trigger>
            <Tooltip.Popup>Tooltip content</Tooltip.Popup>
        </Tooltip.Root>
        {/* Tooltip with delay and closeDelay */}
        <Tooltip.Root>
            <Tooltip.Trigger delay={300} closeDelay={100}>
                Hover me
            </Tooltip.Trigger>
            <Tooltip.Popup>Tooltip content</Tooltip.Popup>
        </Tooltip.Root>
        {/* No props to move - should remain unchanged */}
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>Content</Menu.Popup>
        </Menu.Root>
    </>
);
