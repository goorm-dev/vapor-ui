import { Menu } from '@vapor-ui/core';
import { Button } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Menu.Root>
            <Menu.Trigger render={<Button>Open</Button>} />
            <Menu.Portal>
                <Menu.Content>
                    <Menu.Item render={<a href="/home">Home</a>} />
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
}
