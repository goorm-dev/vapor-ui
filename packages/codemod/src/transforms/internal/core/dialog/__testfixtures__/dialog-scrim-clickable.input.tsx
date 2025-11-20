import { Dialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <>
        <Dialog scrimClickable={true}>
            <Dialog.Trigger>Open 1</Dialog.Trigger>
            <Dialog.Contents>Content 1</Dialog.Contents>
        </Dialog>
        <Dialog scrimClickable={false}>
            <Dialog.Trigger>Open 2</Dialog.Trigger>
            <Dialog.Contents>Content 2</Dialog.Contents>
        </Dialog>
        <Dialog scrimClickable>
            <Dialog.Trigger>Open 3</Dialog.Trigger>
            <Dialog.Contents>Content 3</Dialog.Contents>
        </Dialog>
    </>
);
