import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    positionerProps={{
                        side: 'bottom',
                    }}
                >
                    Content
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
