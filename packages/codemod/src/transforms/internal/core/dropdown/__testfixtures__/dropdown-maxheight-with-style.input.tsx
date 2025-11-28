// @ts-nocheck
import { Dropdown } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Dropdown>
            <Dropdown.Trigger>Open</Dropdown.Trigger>
            <Dropdown.Portal>
                <Dropdown.Content maxHeight="300px" style={{ width: '200px' }}>
                    <Dropdown.Item>Item 1</Dropdown.Item>
                    <Dropdown.Item>Item 2</Dropdown.Item>
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown>
    );
}
