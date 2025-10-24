import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content
                positionerProps={{
                    side: 'right',
                    align: 'center',
                }}
            >
                Content
            </Popover.Content>
        </Popover.Root>
    );
}
