import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger render={<button>Open</button>} />
            <Popover.Portal>
                <Popover.Content>Content</Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
