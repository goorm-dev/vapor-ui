import { Dialog } from '@vapor-ui/core';
import { useState } from 'react';

export const Component = () => {
    const [open, setOpen] = useState(false);
    const [secondOpen, setSecondOpen] = useState(false);

    return (
        <>
            <Dialog.Root open={open} onOpenChange={setOpen} defaultOpen={false}>
                <Dialog.Trigger>Controlled Dialog</Dialog.Trigger>
                <Dialog.Content>
                    <Dialog.Title>Controlled</Dialog.Title>
                    <Dialog.Body>This is a controlled dialog</Dialog.Body>
                </Dialog.Content>
            </Dialog.Root>
            <Dialog.Root
                open={secondOpen}
                onOpenChange={(newOpen) => {
                    console.log('Dialog state:', newOpen);
                    setSecondOpen(newOpen);
                }}
            >
                <Dialog.Trigger>Another Dialog</Dialog.Trigger>
                <Dialog.Content>Content</Dialog.Content>
            </Dialog.Root>
        </>
    );
};
