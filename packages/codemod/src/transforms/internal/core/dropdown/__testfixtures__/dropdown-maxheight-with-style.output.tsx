import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Portal>
                <Menu.PopupPrimitive
                    style={{
                        width: '200px',
                        maxHeight: '300px',
                    }}
                >
                    <Menu.Item>Item 1</Menu.Item>
                    <Menu.Item>Item 2</Menu.Item>
                </Menu.PopupPrimitive>
            </Menu.Portal>
        </Menu.Root>
    );
}
