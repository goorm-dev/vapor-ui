import { NavigationMenu } from '@vapor-ui/core';

export default function App() {
    return (
        <NavigationMenu.Root direction="vertical" stretch aria-label="Navigation">
            <NavigationMenu.List>
                <NavigationMenu.Item>
                    <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                    <NavigationMenu.Link href="/about">About</NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
