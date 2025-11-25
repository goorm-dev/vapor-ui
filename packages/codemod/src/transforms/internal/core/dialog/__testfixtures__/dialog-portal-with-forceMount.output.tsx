import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal keepMounted>
            <Dialog.Overlay />
            <Dialog.Popup>
                <div>Dialog content</div>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
);
