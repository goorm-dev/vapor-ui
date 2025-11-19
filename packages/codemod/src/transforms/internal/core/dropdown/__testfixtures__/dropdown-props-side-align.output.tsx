import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Portal>
                <Menu.PopupPrimitive
                    positionerProps={{
                        side: 'top',
                        align: 'end',
                    }}
                >
                    <Menu.Item>Item</Menu.Item>
                </Menu.PopupPrimitive>
            </Menu.Portal>
        </Menu.Root>
    );
}
