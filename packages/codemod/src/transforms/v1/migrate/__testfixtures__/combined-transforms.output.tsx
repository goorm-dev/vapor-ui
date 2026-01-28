// @ts-nocheck
import { Menu, Popover, Tooltip } from '@vapor-ui/core';

export const Component = ({ shouldLoop, shouldTrack }: any) => (
    <>
        {/* Multiple transforms on same element */}
        <Tooltip.Root disableHoverablePopup={false} closeDelay={200}>
            <Tooltip.Trigger delay={500}>Hover</Tooltip.Trigger>
            <Tooltip.PositionerPrimitive disableAnchorTracking={!shouldTrack}>
                <Tooltip.Popup>Content</Tooltip.Popup>
            </Tooltip.PositionerPrimitive>
        </Tooltip.Root>

        {/* Menu with all applicable transforms */}
        <Menu.Root loopFocus>
            <Menu.Trigger openOnHover delay={300} closeDelay={150}>Open</Menu.Trigger>
            <Menu.PositionerPrimitive disableAnchorTracking={false}>
                <Menu.Popup>
                    <Menu.Item>Item 1</Menu.Item>
                </Menu.Popup>
            </Menu.PositionerPrimitive>
        </Menu.Root>

        {/* Popover with all applicable transforms */}
        <Popover.Root>
            <Popover.Trigger openOnHover delay={400}>Open</Popover.Trigger>
            <Popover.PositionerPrimitive disableAnchorTracking={true}>
                <Popover.Popup>Content</Popover.Popup>
            </Popover.PositionerPrimitive>
        </Popover.Root>
    </>
);
