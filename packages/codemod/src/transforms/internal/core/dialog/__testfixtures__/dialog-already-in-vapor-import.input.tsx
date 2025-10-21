import { Dialog } from '@vapor-ui/core';
import { Dialog as OldDialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <div>
        <Dialog.Root>
            <Dialog.Trigger>Already migrated</Dialog.Trigger>
            <Dialog.Content>Content</Dialog.Content>
        </Dialog.Root>
        <OldDialog>
            <OldDialog.Trigger>To migrate</OldDialog.Trigger>
            <OldDialog.Contents>Old content</OldDialog.Contents>
        </OldDialog>
    </div>
);
