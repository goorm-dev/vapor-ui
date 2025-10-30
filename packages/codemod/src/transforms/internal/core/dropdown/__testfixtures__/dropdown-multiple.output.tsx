import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <div>
            <Menu.Root>
                <Menu.Trigger>Menu 1</Menu.Trigger>
                <Menu.Content
                    positionerProps={{
                        side: 'bottom',
                    }}
                >
                    <Menu.Item>Item A</Menu.Item>
                </Menu.Content>
            </Menu.Root>
            <Menu.Root>
                <Menu.Trigger>Menu 2</Menu.Trigger>
                <Menu.Content
                    positionerProps={{
                        align: 'center',
                    }}
                >
                    <Menu.Item>Item B</Menu.Item>
                </Menu.Content>
            </Menu.Root>
        </div>
    );
}
