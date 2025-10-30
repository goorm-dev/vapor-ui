import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <>
            <Popover.Root>
                <Popover.Trigger>Open 1</Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content
                        positionerProps={{
                            side: 'top',
                        }}
                    >
                        Content 1
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
            <Popover.Root>
                <Popover.Trigger>Open 2</Popover.Trigger>
                <Popover.Content
                    positionerProps={{
                        side: 'bottom',
                        align: 'end',
                    }}
                >
                    Content 2
                </Popover.Content>
            </Popover.Root>
        </>
    );
}
