import { FloatingBar } from '@vapor-ui/core';

export default function Default() {
    return (
        <FloatingBar.Root>
            <FloatingBar.Trigger>Open Action Bar</FloatingBar.Trigger>
            <FloatingBar.Popup>This is the action bar content.</FloatingBar.Popup>
        </FloatingBar.Root>
    );
}
