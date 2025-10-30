import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content>
                    <Popover.Close render={<button>Close</button>} />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
