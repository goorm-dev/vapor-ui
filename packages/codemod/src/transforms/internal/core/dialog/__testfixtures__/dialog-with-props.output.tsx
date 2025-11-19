// @ts-nocheck
import { Dialog } from '@vapor-ui/core';

export const Component = () => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog.Root size="lg" open={open} onOpenChange={setOpen} closeOnClickOverlay={true}>
            <Dialog.Trigger>Open Dialog</Dialog.Trigger>
            <Dialog.Popup>
                <Dialog.Header>
                    <Dialog.Title>Large Dialog</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>Content</Dialog.Body>
            </Dialog.Popup>
        </Dialog.Root>
    );
};
