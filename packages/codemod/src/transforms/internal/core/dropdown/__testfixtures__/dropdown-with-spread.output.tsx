import { Menu } from '@vapor-ui/core';

export default function App() {
    const rootProps = { modal: false };

    return (
        <Menu.Root {...rootProps}>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Portal>
                <Menu.Content
                    positionerProps={{
                        side: 'bottom',
                    }}
                >
                    <Menu.Item>Item</Menu.Item>
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
}
