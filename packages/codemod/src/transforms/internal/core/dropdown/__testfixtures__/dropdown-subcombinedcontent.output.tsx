import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Portal>
                <Menu.Content>
                    <Menu.Item>Item 1</Menu.Item>
                    <Menu.SubmenuRoot>
                        <Menu.SubmenuTriggerItem>Submenu</Menu.SubmenuTriggerItem>
                        <Menu.SubmenuContent>
                            <Menu.Item>Sub Item 1</Menu.Item>
                        </Menu.SubmenuContent>
                    </Menu.SubmenuRoot>
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
}
