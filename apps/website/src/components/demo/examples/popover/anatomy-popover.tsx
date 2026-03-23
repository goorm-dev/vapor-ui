'use client';

import { Button, Popover } from '@vapor-ui/core';

export default function AnatomyPopover() {
    return (
        <Popover.Root data-part="Root" defaultOpen>
            <Popover.Trigger data-part="Trigger" render={<Button variant="outline" />}>
                Open Popover
            </Popover.Trigger>
            <Popover.PortalPrimitive data-part="PortalPrimitive">
                <Popover.PositionerPrimitive data-part="PositionerPrimitive">
                    <Popover.PopupPrimitive data-part="PopupPrimitive">
                        <Popover.Title data-part="Title">Notification</Popover.Title>
                        <Popover.Description data-part="Description">
                            You have 3 new messages and 1 notification.
                        </Popover.Description>
                        <Popover.Close data-part="Close" render={<Button size="sm" />}>
                            Close
                        </Popover.Close>
                    </Popover.PopupPrimitive>
                </Popover.PositionerPrimitive>
            </Popover.PortalPrimitive>
        </Popover.Root>
    );
}
