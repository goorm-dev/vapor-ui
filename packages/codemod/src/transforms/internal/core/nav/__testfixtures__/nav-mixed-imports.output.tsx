import { Badge, Button } from '@goorm-dev/vapor-core';

import { NavigationMenu } from '@vapor-ui/core';

export default function App() {
    return (
        <>
            <Badge>New</Badge>
            <NavigationMenu.Root aria-label="Navigation">
                <NavigationMenu.List>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
                    </NavigationMenu.Item>
                </NavigationMenu.List>
            </NavigationMenu.Root>
            <Button>Click me</Button>
        </>
    );
}
