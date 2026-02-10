import { Popover } from '@goorm-dev/vapor-core';

export default function App() {
    const rootProps = { side: 'bottom' as const, align: 'start' as const };
    const contentProps = { sideOffset: 'space-150' as const, alignOffset: 'space-000' as const };

    return (
        <>
            <Popover {...rootProps}>
                <Popover.Trigger>Open 1</Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content {...contentProps}>Content 1</Popover.Content>
                </Popover.Portal>
            </Popover>
            <Popover side="top">
                <Popover.Trigger>Open 2</Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content>Content 2</Popover.Content>
                </Popover.Portal>
            </Popover>
        </>
    );
}
