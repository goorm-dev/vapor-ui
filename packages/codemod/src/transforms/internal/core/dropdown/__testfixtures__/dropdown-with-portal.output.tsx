import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root modal={false}>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Portal>
                <Menu.Content>
                    <Menu.Item>Item</Menu.Item>
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
}
