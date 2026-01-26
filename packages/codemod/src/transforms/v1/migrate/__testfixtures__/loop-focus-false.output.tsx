import { Menu } from '@base-ui/react';

export const Component = () => (
    <Menu.Root>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Positioner>
            <Menu.Popup loopFocus={false}>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Positioner>
    </Menu.Root>
);
