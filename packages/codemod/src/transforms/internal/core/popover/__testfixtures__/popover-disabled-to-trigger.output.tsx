import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger disabled>Open</Popover.Trigger>
            <Popover.Popup>Content</Popover.Popup>
        </Popover.Root>
    );
}
