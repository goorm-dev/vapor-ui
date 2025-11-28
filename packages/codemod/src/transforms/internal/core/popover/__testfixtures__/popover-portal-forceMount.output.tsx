import { Popover } from '@vapor-ui/core';

export default function App() {
    return (
        <Popover.Root>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Popup portalElement={<Popover.PortalPrimitive keepMounted />}>
                Content
            </Popover.Popup>
        </Popover.Root>
    );
}
