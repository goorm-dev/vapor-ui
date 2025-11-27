import { Dialog as CoreDialog } from '@vapor-ui/core';

export const Component = () => (
    <CoreDialog.Root>
        <CoreDialog.Trigger>Open</CoreDialog.Trigger>
        <CoreDialog.Popup>
            <CoreDialog.Title>Title</CoreDialog.Title>
            <CoreDialog.Body>Body</CoreDialog.Body>
        </CoreDialog.Popup>
    </CoreDialog.Root>
);
