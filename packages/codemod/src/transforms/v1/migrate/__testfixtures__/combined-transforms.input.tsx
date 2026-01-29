import { Menu, NavigationMenu, Popover, Tooltip } from '@vapor-ui/core';

export const Component = ({ shouldLoop, shouldTrack }: any) => (
    <>
        {/* Multiple transforms on same element */}
        <Tooltip.Root hoverable={true} delay={500} closeDelay={200}>
            <Tooltip.Trigger>Hover</Tooltip.Trigger>
            <Tooltip.PositionerPrimitive trackAnchor={shouldTrack}>
                <Tooltip.Popup>Content</Tooltip.Popup>
            </Tooltip.PositionerPrimitive>
        </Tooltip.Root>

        {/* Menu with all applicable transforms */}
        <Menu.Root openOnHover delay={300} closeDelay={150} loop>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.PositionerPrimitive trackAnchor>
                <Menu.Popup>
                    <Menu.Item>Item 1</Menu.Item>
                </Menu.Popup>
            </Menu.PositionerPrimitive>
        </Menu.Root>

        {/* Popover with all applicable transforms */}
        <Popover.Root openOnHover delay={400}>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.PositionerPrimitive trackAnchor={false}>
                <Popover.Popup>Content</Popover.Popup>
            </Popover.PositionerPrimitive>
        </Popover.Root>

        {/* NavigationMenu with selected to current transform */}
        <NavigationMenu.Root>
            <NavigationMenu.List>
                <NavigationMenu.Item>
                    <NavigationMenu.Link selected>Home</NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    </>
);
