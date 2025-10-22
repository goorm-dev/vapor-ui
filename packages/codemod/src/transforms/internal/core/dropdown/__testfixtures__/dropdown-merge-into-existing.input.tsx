import { Dropdown, Button as VaporButton } from '@goorm-dev/vapor-core';
import { Text } from '@vapor-ui/core';

export default function App() {
    return (
        <div>
            <Dropdown>
                <Dropdown.Trigger>Open</Dropdown.Trigger>
                <Dropdown.Portal>
                    <Dropdown.Content>
                        <Dropdown.Item>Item</Dropdown.Item>
                    </Dropdown.Content>
                </Dropdown.Portal>
            </Dropdown>
            <Text>Hello</Text>
            <VaporButton>Click</VaporButton>
        </div>
    );
}
