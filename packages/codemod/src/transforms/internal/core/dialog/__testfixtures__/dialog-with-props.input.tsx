//@ts-nocheck
import { Dialog } from '@goorm-dev/vapor-core';

export const Component = () => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog size="lg" open={open} onOpenChange={setOpen} scrimClickable={true}>
            <Dialog.Trigger>Open Dialog</Dialog.Trigger>
            <Dialog.Contents>
                <Dialog.Header>
                    <Dialog.Title>Large Dialog</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>Content</Dialog.Body>
            </Dialog.Contents>
        </Dialog>
    );
};
