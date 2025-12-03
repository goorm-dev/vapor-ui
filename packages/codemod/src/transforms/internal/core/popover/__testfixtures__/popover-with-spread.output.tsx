import { Popover } from '@vapor-ui/core';

export default function App() {
    const rootProps = { side: 'bottom' as const, align: 'start' as const };
    const contentProps = { sideOffset: 'space-150' as const, alignOffset: 'space-000' as const };

    return (
        <>
            <Popover.Root {...rootProps}>
                <Popover.Trigger>Open 1</Popover.Trigger>
                <Popover.Popup {...contentProps}>Content 1</Popover.Popup>
            </Popover.Root>
            <Popover.Root>
                <Popover.Trigger>Open 2</Popover.Trigger>
                <Popover.Popup positionerElement={<Popover.PositionerPrimitive side="top" />}>
                    Content 2
                </Popover.Popup>
            </Popover.Root>
        </>
    );
}
