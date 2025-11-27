import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root modal={false}>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup portalElement={<Menu.PortalPrimitive keepMounted />}>
                <Menu.Item>Item</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
    );
}
