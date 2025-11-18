import { Dialog as CoreDialog } from '@goorm-dev/vapor-core';

export const Component = () => (
    <CoreDialog>
        <CoreDialog.Trigger>Open</CoreDialog.Trigger>
        <CoreDialog.Contents>
            <CoreDialog.Title>Title</CoreDialog.Title>
            <CoreDialog.Body>Body</CoreDialog.Body>
        </CoreDialog.Contents>
    </CoreDialog>
);
