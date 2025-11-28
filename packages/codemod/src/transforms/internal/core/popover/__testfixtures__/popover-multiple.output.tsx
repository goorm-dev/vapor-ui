import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <>
            <Popover.Root>
                <Popover.Trigger>Open 1</Popover.Trigger>
                <Popover.Popup positionerElement={<Popover.PositionerPrimitive side="top" />}>
                    Content 1
                </Popover.Popup>
            </Popover.Root>
            <Popover.Root>
                <Popover.Trigger>Open 2</Popover.Trigger>
                <Popover.Popup
                    positionerElement={<Popover.PositionerPrimitive side="bottom" align="end" />}
                >
                    Content 2
                </Popover.Popup>
            </Popover.Root>
        </>
    );
}
