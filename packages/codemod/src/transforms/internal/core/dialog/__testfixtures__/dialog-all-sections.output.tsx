// @ts-nocheck
import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <Dialog.Root size="xl" closeOnClickOverlay={false}>
        <Dialog.Trigger>Open Full Dialog</Dialog.Trigger>
        <Dialog.Popup>
            <Dialog.Header>
                <Dialog.Title>Dialog Title</Dialog.Title>
                <Dialog.Description>This is a dialog description</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
                <p>This is the body content of the dialog.</p>
                <p>It can contain multiple elements.</p>
            </Dialog.Body>
            <Dialog.Footer>
                <Dialog.Close>Cancel</Dialog.Close>
                <Dialog.Close render={<button className="primary">Confirm</button>} />
            </Dialog.Footer>
        </Dialog.Popup>
    </Dialog.Root>
);
