'use client';

import { Button, Dialog } from '@vapor-ui/core';

export default function AnatomyDialog() {
    return (
        <Dialog.Root data-part="Root">
            <Dialog.Trigger data-part="Trigger" render={<Button />}>
                Open Dialog
            </Dialog.Trigger>
            <Dialog.PortalPrimitive data-part="PortalPrimitive">
                <Dialog.OverlayPrimitive data-part="OverlayPrimitive" />
                <Dialog.PopupPrimitive data-part="PopupPrimitive">
                    <Dialog.Header data-part="Header">
                        <Dialog.Title data-part="Title">Dialog Title</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body data-part="Body">
                        <Dialog.Description data-part="Description">
                            This is the dialog body content. You can add any content here.
                        </Dialog.Description>
                    </Dialog.Body>
                    <Dialog.Footer data-part="Footer" style={{ marginLeft: 'auto' }}>
                        <Dialog.Close
                            data-part="Close"
                            render={<Button colorPalette="primary">Close</Button>}
                        />
                    </Dialog.Footer>
                </Dialog.PopupPrimitive>
            </Dialog.PortalPrimitive>
        </Dialog.Root>
    );
}
