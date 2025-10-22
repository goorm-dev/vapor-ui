import { Dropdown } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <div>
            <Dropdown side="bottom">
                <Dropdown.Trigger>Menu 1</Dropdown.Trigger>
                <Dropdown.Contents>
                    <Dropdown.Item>Item A</Dropdown.Item>
                </Dropdown.Contents>
            </Dropdown>
            <Dropdown align="center">
                <Dropdown.Trigger>Menu 2</Dropdown.Trigger>
                <Dropdown.CombinedContent>
                    <Dropdown.Item>Item B</Dropdown.Item>
                </Dropdown.CombinedContent>
            </Dropdown>
        </div>
    );
}
