import { Dialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Dialog size="xl" scrimClickable={false}>
        <Dialog.Trigger>Open Full Dialog</Dialog.Trigger>
        <Dialog.Contents>
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
                <Dialog.Close asChild>
                    <button className="primary">Confirm</button>
                </Dialog.Close>
            </Dialog.Footer>
        </Dialog.Contents>
    </Dialog>
);
