import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content>This is a basic popover example.</Popover.Content>
        </Popover.Root>
    );
}
