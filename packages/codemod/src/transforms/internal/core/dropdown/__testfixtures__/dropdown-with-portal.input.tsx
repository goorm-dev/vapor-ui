// @ts-nocheck
import { Dropdown } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Dropdown modal={false}>
            <Dropdown.Trigger>Open</Dropdown.Trigger>
            <Dropdown.Portal>
                <Dropdown.Content>
                    <Dropdown.Item>Item</Dropdown.Item>
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown>
    );
}
