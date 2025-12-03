import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <div>Anchor</div>
            <Popover.Trigger>Open</Popover.Trigger>

            <Popover.Popup>Content</Popover.Popup>
        </Popover.Root>
    );
}
