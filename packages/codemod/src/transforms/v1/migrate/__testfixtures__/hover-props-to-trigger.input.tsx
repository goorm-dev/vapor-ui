import { Menu, Popover, Tooltip } from '@vapor-ui/core';

export const Component = () => (
    <>
        {/* Menu with openOnHover */}
        <Menu.Root openOnHover>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>Content</Menu.Popup>
        </Menu.Root>
        {/* Menu with delay and closeDelay */}
        <Menu.Root openOnHover delay={200} closeDelay={100}>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>Content</Menu.Popup>
        </Menu.Root>
        {/* Popover with openOnHover */}
        <Popover.Root openOnHover>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Popup>Content</Popover.Popup>
        </Popover.Root>
        {/* Popover with all props */}
        <Popover.Root openOnHover delay={300} closeDelay={150}>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Popup>Content</Popover.Popup>
        </Popover.Root>
        {/* Tooltip with delay only */}
        <Tooltip.Root delay={500}>
            <Tooltip.Trigger>Hover me</Tooltip.Trigger>
            <Tooltip.Popup>Tooltip content</Tooltip.Popup>
        </Tooltip.Root>
        {/* Tooltip with another delay value */}
        <Tooltip.Root delay={300}>
            <Tooltip.Trigger>Hover me</Tooltip.Trigger>
            <Tooltip.Popup>Tooltip content</Tooltip.Popup>
        </Tooltip.Root>
        {/* No props to move - should remain unchanged */}
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>Content</Menu.Popup>
        </Menu.Root>
    </>
);
