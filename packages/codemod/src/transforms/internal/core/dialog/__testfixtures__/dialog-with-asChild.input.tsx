import { Dialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Dialog>
        <Dialog.Trigger asChild>
            <button className="custom-button">Open Dialog</button>
        </Dialog.Trigger>
        <Dialog.Contents>
            <Dialog.Close asChild>
                <button>Close</button>
            </Dialog.Close>
        </Dialog.Contents>
    </Dialog>
);
