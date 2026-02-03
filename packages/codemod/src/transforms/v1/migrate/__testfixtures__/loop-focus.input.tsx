import { Menu } from '@vapor-ui/core';

export const Component = ({ shouldLoop }: { shouldLoop: boolean }) => (
    <>
        {/* true */}
        <Menu.Root loop={true}>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
        {/* false */}
        <Menu.Root loop={false}>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
        {/* shorthand */}
        <Menu.Root loop>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
        {/* expression */}
        <Menu.Root loop={shouldLoop}>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
    </>
);
