import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Portal keepMounted>
                <Popover.Content>Content</Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
