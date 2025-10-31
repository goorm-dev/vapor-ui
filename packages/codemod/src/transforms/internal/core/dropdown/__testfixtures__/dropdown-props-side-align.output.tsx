import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Portal>
                <Menu.Content
                    positionerProps={{
                        side: 'top',
                        align: 'end',
                    }}
                >
                    <Menu.Item>Item</Menu.Item>
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
}
