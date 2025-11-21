import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Portal>
                <Menu.PopupPrimitive>
                    <Menu.Group>
                        <Menu.Item>A</Menu.Item>
                        <Menu.Item>B</Menu.Item>
                    </Menu.Group>
                    <Menu.Group>
                        <Menu.Item>C</Menu.Item>
                    </Menu.Group>
                </Menu.PopupPrimitive>
            </Menu.Portal>
        </Menu.Root>
    );
}
