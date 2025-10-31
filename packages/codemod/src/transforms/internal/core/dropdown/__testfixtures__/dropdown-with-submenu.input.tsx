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
                        <Dropdown.Portal>
                            <Dropdown.SubContent>
                                <Dropdown.Item>Sub 1</Dropdown.Item>
                                <Dropdown.Item>Sub 2</Dropdown.Item>
                            </Dropdown.SubContent>
                        </Dropdown.Portal>
                    </Dropdown.Sub>
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown>
    );
}
