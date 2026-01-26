import { Menu } from '@base-ui/react';

export const Component = ({ shouldLoop }: { shouldLoop: boolean }) => (
    <Menu.Root>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Positioner>
            <Menu.Popup loopFocus={shouldLoop}>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Positioner>
    </Menu.Root>
);
