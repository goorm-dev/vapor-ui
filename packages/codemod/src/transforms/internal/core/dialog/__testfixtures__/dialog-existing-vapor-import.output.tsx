// @ts-nocheck
import { Dialog, Button } from '@vapor-ui/core';

export const Component = () => (
    <Dialog.Root>
        <Dialog.Trigger render={<Button>Open</Button>} />
        <Dialog.Content>Content</Dialog.Content>
    </Dialog.Root>
);
