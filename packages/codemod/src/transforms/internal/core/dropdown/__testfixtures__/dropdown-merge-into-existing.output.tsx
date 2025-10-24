import { Button as VaporButton } from '@goorm-dev/vapor-core';
import { Text, Menu } from '@vapor-ui/core';

export default function App() {
    return (
        <div>
            <Menu.Root>
                <Menu.Trigger>Open</Menu.Trigger>
                <Menu.Portal>
                    <Menu.Content>
                        <Menu.Item>Item</Menu.Item>
                    </Menu.Content>
                </Menu.Portal>
            </Menu.Root>
            <Text>Hello</Text>
            <VaporButton>Click</VaporButton>
        </div>
    );
}
