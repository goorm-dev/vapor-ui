import { Popover } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Popover>
            <Popover.Trigger asChild>
                <button>Open</button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content>Content</Popover.Content>
            </Popover.Portal>
        </Popover>
    );
}
