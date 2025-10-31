import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Portal>
                <Menu.Content>
                    <Menu.Item>Item 1</Menu.Item>
                    <Menu.Item>Item 2</Menu.Item>
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
}
