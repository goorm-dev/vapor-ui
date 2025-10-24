import { Dialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <div>
        <Dialog size="md">
            <Dialog.Trigger>First Dialog</Dialog.Trigger>
            <Dialog.Contents>
                <Dialog.Title>First</Dialog.Title>
            </Dialog.Contents>
        </Dialog>

        <Dialog size="lg" scrimClickable={true}>
            <Dialog.Trigger>Second Dialog</Dialog.Trigger>
            <Dialog.CombinedContent>
                <Dialog.Title>Second</Dialog.Title>
            </Dialog.CombinedContent>
        </Dialog>

        <Dialog size="xl">
            <Dialog.Trigger>Third Dialog</Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content>
                    <Dialog.Title>Third</Dialog.Title>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    </div>
);
