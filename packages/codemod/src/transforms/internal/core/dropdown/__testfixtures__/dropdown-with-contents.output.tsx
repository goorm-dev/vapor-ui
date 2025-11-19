import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>
                <Menu.Item>Item 1</Menu.Item>
                <Menu.Item>Item 2</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
    );
}
