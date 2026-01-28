// @ts-nocheck
import { Menu } from '@vapor-ui/core';

export const Component = ({ shouldLoop }: { shouldLoop: boolean }) => (
    <>
        {/* true */}
        <Menu.Root loopFocus={true}>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
        {/* false */}
        <Menu.Root loopFocus={false}>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
        {/* shorthand */}
        <Menu.Root loopFocus>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
        {/* expression */}
        <Menu.Root loopFocus={shouldLoop}>
            <Menu.Trigger>Open</Menu.Trigger>
            <Menu.Popup>
                <Menu.Item>Item 1</Menu.Item>
            </Menu.Popup>
        </Menu.Root>
    </>
);
