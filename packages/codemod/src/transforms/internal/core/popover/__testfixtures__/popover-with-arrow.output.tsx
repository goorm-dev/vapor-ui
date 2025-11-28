import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Popup
                positionerElement={<Popover.PositionerPrimitive sideOffset={12} alignOffset={0} />}
            >
                Content
            </Popover.Popup>
        </Popover.Root>
    );
}
