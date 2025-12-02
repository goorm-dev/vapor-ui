import { Popover } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Popover>
            <Popover.Anchor>
                <div>Anchor</div>
                <Popover.Trigger>Open</Popover.Trigger>
            </Popover.Anchor>
            <Popover.Portal>
                <Popover.Content>Content</Popover.Content>
            </Popover.Portal>
        </Popover>
    );
}
