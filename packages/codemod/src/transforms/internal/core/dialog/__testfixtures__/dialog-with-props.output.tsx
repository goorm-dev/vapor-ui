// @ts-nocheck
import { Dialog } from '@vapor-ui/core';

export const Component = () => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog.Root size="lg" open={open} onOpenChange={setOpen} closeOnClickOverlay={true}>
            <Dialog.Trigger>Open Dialog</Dialog.Trigger>
<<<<<<< HEAD
            <Dialog.Content>
=======
            <Dialog.Popup>
>>>>>>> e25e8cb043337cb2084a990240957bdb31b22d93
                <Dialog.Header>
                    <Dialog.Title>Large Dialog</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>Content</Dialog.Body>
<<<<<<< HEAD
            </Dialog.Content>
=======
            </Dialog.Popup>
>>>>>>> e25e8cb043337cb2084a990240957bdb31b22d93
        </Dialog.Root>
    );
};
