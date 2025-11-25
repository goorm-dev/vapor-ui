import { useState } from 'react';

import { Dialog } from '@vapor-ui/core';

export const Component = () => {
    const [open, setOpen] = useState(false);
    const [secondOpen, setSecondOpen] = useState(false);

    return (
        <>
            <Dialog.Root open={open} onOpenChange={setOpen} defaultOpen={false}>
                <Dialog.Trigger>Controlled Dialog</Dialog.Trigger>
                <Dialog.Popup>
                    <Dialog.Title>Controlled</Dialog.Title>
                    <Dialog.Body>This is a controlled dialog</Dialog.Body>
                </Dialog.Popup>
            </Dialog.Root>
            <Dialog.Root
                open={secondOpen}
                onOpenChange={(newOpen) => {
                    console.log('Dialog state:', newOpen);
                    setSecondOpen(newOpen);
                }}
            >
                <Dialog.Trigger>Another Dialog</Dialog.Trigger>
                <Dialog.Popup>Content</Dialog.Popup>
            </Dialog.Root>
        </>
    );
};
