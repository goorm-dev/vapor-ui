import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Popup
                positionerElement={<Popover.PositionerPrimitive side="right" align="center" />}
            >
                Content
            </Popover.Popup>
        </Popover.Root>
    );
}
