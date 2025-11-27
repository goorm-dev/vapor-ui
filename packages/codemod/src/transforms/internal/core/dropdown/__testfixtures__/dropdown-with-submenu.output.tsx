import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>
                <Menu.Item>Item 1</Menu.Item>
                <Menu.SubmenuRoot>
                    <Menu.SubmenuTriggerItem>Submenu</Menu.SubmenuTriggerItem>
                    <Menu.SubmenuPopup>
                        <Menu.Item>Sub 1</Menu.Item>
                        <Menu.Item>Sub 2</Menu.Item>
                    </Menu.SubmenuPopup>
                </Menu.SubmenuRoot>
            </Menu.Popup>
        </Menu.Root>
    );
}
