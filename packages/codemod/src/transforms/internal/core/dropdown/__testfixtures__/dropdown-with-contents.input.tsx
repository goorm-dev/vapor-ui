import { Dropdown } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Dropdown>
            <Dropdown.Trigger>Open</Dropdown.Trigger>
            <Dropdown.Contents>
                <Dropdown.Item>Item 1</Dropdown.Item>
                <Dropdown.Item>Item 2</Dropdown.Item>
            </Dropdown.Contents>
        </Dropdown>
    );
}
