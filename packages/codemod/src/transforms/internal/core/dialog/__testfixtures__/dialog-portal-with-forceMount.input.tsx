import { Dialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Dialog>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal forceMount>
            <Dialog.Overlay />
            <Dialog.Contents>
                <div>Dialog content</div>
            </Dialog.Contents>
        </Dialog.Portal>
    </Dialog>
);
