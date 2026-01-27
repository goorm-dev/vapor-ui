import { Menu } from '@vapor-ui/core';

export const Component = ({ shouldLoop }: { shouldLoop: boolean }) => (
    <>
        {/* true */}
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup loopFocus={true}>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
        {/* false */}
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup loopFocus={false}>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
        {/* shorthand */}
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup loopFocus>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
        {/* expression */}
        <Menu.Root>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup loopFocus={shouldLoop}>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
    </>
);
