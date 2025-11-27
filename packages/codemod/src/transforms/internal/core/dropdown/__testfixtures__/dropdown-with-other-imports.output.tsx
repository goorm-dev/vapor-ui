// @ts-nocheck
import { Button } from '@goorm-dev/vapor-core';
import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <div>
            <Menu.Root>
                <Menu.Trigger>Open</Menu.Trigger>
                <Menu.Popup>
                    <Menu.Item>Item</Menu.Item>
                </Menu.Popup>
            </Menu.Root>
            <Button>Click me</Button>
        </div>
    );
}
