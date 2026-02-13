'use client';

import { Button, Sheet } from '@vapor-ui/core';

export default function AnatomySheet() {
    return (
        <Sheet.Root data-part="Root">
            <Sheet.Trigger data-part="Trigger" render={<Button variant="outline" />}>
                Open Sheet
            </Sheet.Trigger>
            <Sheet.PortalPrimitive data-part="PortalPrimitive">
                <Sheet.OverlayPrimitive data-part="OverlayPrimitive" />
                <Sheet.PositionerPrimitive data-part="PositionerPrimitive">
                    <Sheet.PopupPrimitive data-part="PopupPrimitive">
                        <Sheet.Popup data-part="Popup">
                            <Sheet.Header data-part="Header">
                                <Sheet.Title data-part="Title">Sheet Title</Sheet.Title>
                            </Sheet.Header>
                            <Sheet.Body data-part="Body">
                                <Sheet.Description data-part="Description">
                                    This sheet slides in from the edge of the screen.
                                </Sheet.Description>
                            </Sheet.Body>
                            <Sheet.Footer data-part="Footer">
                                <Sheet.Close
                                    data-part="Close"
                                    render={<Button colorPalette="primary">Confirm</Button>}
                                />
                            </Sheet.Footer>
                        </Sheet.Popup>
                    </Sheet.PopupPrimitive>
                </Sheet.PositionerPrimitive>
            </Sheet.PortalPrimitive>
        </Sheet.Root>
    );
}
