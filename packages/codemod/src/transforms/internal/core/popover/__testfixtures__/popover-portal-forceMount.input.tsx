import { Popover } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Popover>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Portal forceMount>
                <Popover.Content>Content</Popover.Content>
            </Popover.Portal>
        </Popover>
    );
}
