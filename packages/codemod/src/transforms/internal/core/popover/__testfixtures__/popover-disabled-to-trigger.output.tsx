import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger disabled>Open</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content>Content</Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
