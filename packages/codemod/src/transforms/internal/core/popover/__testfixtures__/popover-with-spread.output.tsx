import { Popover } from '@vapor-ui/core';

export default function App() {
    const rootProps = { side: 'bottom' as const, align: 'start' as const };
    const contentProps = { sideOffset: 'space-150' as const, alignOffset: 'space-000' as const };

    return (
        <>
            <Popover.Root {...rootProps}>
                <Popover.Trigger>Open 1</Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content {...contentProps}>Content 1</Popover.Content>
                </Popover.Portal>
            </Popover.Root>
            <Popover.Root>
                <Popover.Trigger>Open 2</Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content
                        positionerProps={{
                            side: 'top',
                        }}
                    >
                        Content 2
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </>
    );
}
