import { Popover } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Popover>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content>
                    <Popover.Close asChild>
                        <button>Close</button>
                    </Popover.Close>
                </Popover.Content>
            </Popover.Portal>
        </Popover>
    );
}
