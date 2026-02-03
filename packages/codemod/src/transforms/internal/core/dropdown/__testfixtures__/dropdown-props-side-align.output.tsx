// @ts-nocheck
import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup positionerElement={<Menu.PositionerPrimitive side="top" align="end" />}>
                <Menu.Item>Item</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
    );
}
