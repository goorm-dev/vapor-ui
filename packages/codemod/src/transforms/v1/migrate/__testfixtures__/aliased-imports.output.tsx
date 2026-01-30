// @ts-nocheck
import {
    Menu as VaporMenu,
    Popover as VaporPopover,
    Tooltip as VaporTooltip,
} from '@vapor-ui/core';

export const Component = () => (
    <>
        {/* Menu with alias */}
        <VaporMenu.Root loopFocus>
            <VaporMenu.Trigger openOnHover delay={200}>
                Open
            </VaporMenu.Trigger>
            <VaporMenu.Popup>Content</VaporMenu.Popup>
        </VaporMenu.Root>

        {/* Popover with alias */}
        <VaporPopover.Root>
            <VaporPopover.Trigger delay={300} closeDelay={150}>
                Open
            </VaporPopover.Trigger>
            <VaporPopover.PositionerPrimitive disableAnchorTracking={false}>
                <VaporPopover.Popup>Content</VaporPopover.Popup>
            </VaporPopover.PositionerPrimitive>
        </VaporPopover.Root>

        {/* Tooltip with alias */}
        <VaporTooltip.Root disableHoverablePopup={true}>
            <VaporTooltip.Trigger delay={500}>Hover</VaporTooltip.Trigger>
            <VaporTooltip.PositionerPrimitive disableAnchorTracking={false}>
                <VaporTooltip.Popup>Content</VaporTooltip.Popup>
            </VaporTooltip.PositionerPrimitive>
        </VaporTooltip.Root>
    </>
);
