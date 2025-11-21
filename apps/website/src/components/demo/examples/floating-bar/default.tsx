import { FloatingBar } from '@vapor-ui/core';

export default function Default() {
    return (
        <FloatingBar.Root>
            <FloatingBar.Trigger>Open Floating Bar</FloatingBar.Trigger>
            <FloatingBar.Popup>This is the floating bar content.</FloatingBar.Popup>
        </FloatingBar.Root>
    );
}
