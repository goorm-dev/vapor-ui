// @ts-nocheck
import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <Dialog.Root>
        <Dialog.Trigger render={<button className="custom-button">Open Dialog</button>} />
        <Dialog.Content>
            <Dialog.Close render={<button>Close</button>} />
        </Dialog.Content>
    </Dialog.Root>
);
