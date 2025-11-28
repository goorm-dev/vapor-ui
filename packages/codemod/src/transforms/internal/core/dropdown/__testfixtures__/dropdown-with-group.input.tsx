// @ts-nocheck
import { Dropdown } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Dropdown>
            <Dropdown.Trigger>Open</Dropdown.Trigger>
            <Dropdown.Portal>
                <Dropdown.Content>
                    <Dropdown.Group>
                        <Dropdown.Item>A</Dropdown.Item>
                        <Dropdown.Item>B</Dropdown.Item>
                    </Dropdown.Group>
                    <Dropdown.Group>
                        <Dropdown.Item>C</Dropdown.Item>
                    </Dropdown.Group>
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown>
    );
}
