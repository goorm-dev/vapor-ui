// @ts-nocheck
import {
    Menu as VaporMenu,
    Popover as VaporPopover,
    Tooltip as VaporTooltip,
} from '@vapor-ui/core';

export const Component = () => (
    <>
        {/* Menu with alias */}
        <VaporMenu.Root openOnHover delay={200} loop>
            <VaporMenu.Trigger>Open</VaporMenu.Trigger>
            <VaporMenu.Popup>Content</VaporMenu.Popup>
        </VaporMenu.Root>

        {/* Popover with alias */}
        <VaporPopover.Root delay={300} closeDelay={150}>
            <VaporPopover.Trigger>Open</VaporPopover.Trigger>
            <VaporPopover.PositionerPrimitive trackAnchor>
                <VaporPopover.Popup>Content</VaporPopover.Popup>
            </VaporPopover.PositionerPrimitive>
        </VaporPopover.Root>

        {/* Tooltip with alias */}
        <VaporTooltip.Root hoverable={false} delay={500}>
            <VaporTooltip.Trigger>Hover</VaporTooltip.Trigger>
            <VaporTooltip.PositionerPrimitive trackAnchor>
                <VaporTooltip.Popup>Content</VaporTooltip.Popup>
            </VaporTooltip.PositionerPrimitive>
        </VaporTooltip.Root>
    </>
);
