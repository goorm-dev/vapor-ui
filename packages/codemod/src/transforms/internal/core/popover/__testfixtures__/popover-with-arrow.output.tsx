import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    positionerProps={{
                        sideOffset: 12,
                        alignOffset: 0,
                    }}
                >
                    Content
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
