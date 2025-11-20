import { ActionBar } from '@vapor-ui/core';

export default function Default() {
    return (
        <ActionBar.Root>
            <ActionBar.Trigger>Open Action Bar</ActionBar.Trigger>
            <ActionBar.Popup>This is the action bar content.</ActionBar.Popup>
        </ActionBar.Root>
    );
}
