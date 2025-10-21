import { Dialog } from '@goorm-dev/vapor-core';
import { useState } from 'react';

export const Component = () => {
    const [open, setOpen] = useState(false);
    const [secondOpen, setSecondOpen] = useState(false);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen} defaultOpen={false}>
                <Dialog.Trigger>Controlled Dialog</Dialog.Trigger>
                <Dialog.Contents>
                    <Dialog.Title>Controlled</Dialog.Title>
                    <Dialog.Body>This is a controlled dialog</Dialog.Body>
                </Dialog.Contents>
            </Dialog>

            <Dialog
                open={secondOpen}
                onOpenChange={(newOpen) => {
                    console.log('Dialog state:', newOpen);
                    setSecondOpen(newOpen);
                }}
            >
                <Dialog.Trigger>Another Dialog</Dialog.Trigger>
                <Dialog.Contents>Content</Dialog.Contents>
            </Dialog>
        </>
    );
};
