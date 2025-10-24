import { Dropdown } from '@goorm-dev/vapor-core';
import { Button } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Dropdown>
            <Dropdown.Trigger asChild>
                <Button>Open</Button>
            </Dropdown.Trigger>
            <Dropdown.Portal>
                <Dropdown.Content>
                    <Dropdown.Item asChild>
                        <a href="/home">Home</a>
                    </Dropdown.Item>
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown>
    );
}
