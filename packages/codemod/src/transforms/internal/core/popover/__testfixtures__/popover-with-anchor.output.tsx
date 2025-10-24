import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <div>Anchor</div>
            <Popover.Trigger>Open</Popover.Trigger>

            <Popover.Portal>
                <Popover.Content>Content</Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
