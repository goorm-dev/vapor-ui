import { Dropdown } from '@goorm-dev/vapor-core';

export default function App() {
    const rootProps = { modal: false };

    return (
        <Dropdown side="bottom" {...rootProps}>
            <Dropdown.Trigger>Open</Dropdown.Trigger>
            <Dropdown.Portal>
                <Dropdown.Content>
                    <Dropdown.Item>Item</Dropdown.Item>
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown>
    );
}
