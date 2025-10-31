import { Dropdown } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Dropdown>
            <Dropdown.Trigger>Open</Dropdown.Trigger>
            <Dropdown.Portal>
                <Dropdown.Content>
                    <Dropdown.Item>Item 1</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item>Item 2</Dropdown.Item>
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown>
    );
}
