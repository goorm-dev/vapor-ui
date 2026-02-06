'use client';

import { FloatingBar } from '@vapor-ui/core';

export default function AnatomyFloatingBar() {
    return (
        <FloatingBar.Root data-part="Root">
            <FloatingBar.Trigger data-part="Trigger">Open Floating Bar</FloatingBar.Trigger>
            <FloatingBar.PortalPrimitive data-part="PortalPrimitive">
                <FloatingBar.PositionerPrimitive data-part="PositionerPrimitive">
                    <FloatingBar.PopupPrimitive data-part="PopupPrimitive">
                        This is the floating bar content.
                        <FloatingBar.Close data-part="Close">Close</FloatingBar.Close>
                    </FloatingBar.PopupPrimitive>
                </FloatingBar.PositionerPrimitive>
            </FloatingBar.PortalPrimitive>
        </FloatingBar.Root>
    );
}
