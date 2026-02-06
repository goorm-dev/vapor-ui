'use client';

import { IconButton, Tooltip } from '@vapor-ui/core';
import { BoldOutlineIcon } from '@vapor-ui/icons';

export default function AnatomyTooltip() {
    return (
        <Tooltip.Root data-part="Root" open>
            <Tooltip.Trigger
                data-part="Trigger"
                render={
                    <IconButton>
                        <BoldOutlineIcon />
                    </IconButton>
                }
            />
            <Tooltip.PortalPrimitive data-part="PortalPrimitive">
                <Tooltip.PositionerPrimitive data-part="PositionerPrimitive">
                    <Tooltip.PopupPrimitive data-part="PopupPrimitive">
                        <Tooltip.Popup data-part="Popup">Bold</Tooltip.Popup>
                    </Tooltip.PopupPrimitive>
                </Tooltip.PositionerPrimitive>
            </Tooltip.PortalPrimitive>
        </Tooltip.Root>
    );
}
