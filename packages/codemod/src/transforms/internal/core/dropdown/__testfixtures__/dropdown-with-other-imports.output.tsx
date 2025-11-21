import { Button } from '@goorm-dev/vapor-core';
import { Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <div>
            <Menu.Root>
                <Menu.Trigger>Open</Menu.Trigger>
                <Menu.Portal>
                    <Menu.PopupPrimitive>
                        <Menu.Item>Item</Menu.Item>
                    </Menu.PopupPrimitive>
                </Menu.Portal>
            </Menu.Root>
            <Button>Click me</Button>
        </div>
    );
}
