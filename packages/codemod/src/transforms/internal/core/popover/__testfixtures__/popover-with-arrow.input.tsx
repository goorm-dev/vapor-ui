import { Popover } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Popover>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content sideOffset="space-150" alignOffset="space-000">
                    <Popover.Arrow />
                    Content
                </Popover.Content>
            </Popover.Portal>
        </Popover>
    );
}
