// @ts-nocheck
import { Button, Dropdown } from '@goorm-dev/vapor-core';

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
            <Button>Click me</Button>
        </div>
    );
}
