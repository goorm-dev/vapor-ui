import { Dialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Dialog>
        <Dialog.Trigger asChild>
            <button className="btn" type="button" aria-label="Open">
                Open Dialog
            </button>
        </Dialog.Trigger>
        <Dialog.Contents>
            <Dialog.Header>
                <div className="custom-header">
                    <Dialog.Title>Title</Dialog.Title>
                </div>
            </Dialog.Header>
        </Dialog.Contents>
    </Dialog>
);
