import { Dropdown } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Dropdown>
            <Dropdown.Trigger>Open</Dropdown.Trigger>
            <Dropdown.Portal>
                <Dropdown.Content>
                    <Dropdown.Item>Item 1</Dropdown.Item>
                    <Dropdown.Sub>
                        <Dropdown.SubTrigger>Submenu</Dropdown.SubTrigger>
                        <Dropdown.SubCombinedContent>
                            <Dropdown.Item>Sub Item 1</Dropdown.Item>
                        </Dropdown.SubCombinedContent>
                    </Dropdown.Sub>
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown>
    );
}
