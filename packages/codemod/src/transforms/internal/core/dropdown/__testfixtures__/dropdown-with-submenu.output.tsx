import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Portal>
                <Menu.PopupPrimitive>
                    <Menu.Item>Item 1</Menu.Item>
                    <Menu.SubmenuRoot>
                        <Menu.SubmenuTriggerItem>Submenu</Menu.SubmenuTriggerItem>
                        <Menu.Portal>
                            <Menu.SubmenuPopup>
                                <Menu.Item>Sub 1</Menu.Item>
                                <Menu.Item>Sub 2</Menu.Item>
                            </Menu.SubmenuPopup>
                        </Menu.Portal>
                    </Menu.SubmenuRoot>
                </Menu.PopupPrimitive>
            </Menu.Portal>
        </Menu.Root>
    );
}
