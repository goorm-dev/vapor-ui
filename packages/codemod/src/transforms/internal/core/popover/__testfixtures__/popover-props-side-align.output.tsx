import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Popup
                positionerElement={<Popover.PositionerPrimitive side="bottom" align="start" />}
            >
                Content
            </Popover.Popup>
        </Popover.Root>
    );
}
