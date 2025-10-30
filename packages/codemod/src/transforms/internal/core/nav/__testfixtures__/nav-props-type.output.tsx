import { NavigationMenu } from '@vapor-ui/core';

export default function App() {
    return (
        <NavigationMenu.Root
            size="md"
            stretch={false}
            direction="horizontal"
            aria-label="Navigation"
        >
            <NavigationMenu.List>
                <NavigationMenu.Item>
                    <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
