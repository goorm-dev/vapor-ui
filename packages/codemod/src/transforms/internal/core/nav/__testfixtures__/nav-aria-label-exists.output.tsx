import { NavigationMenu } from '@vapor-ui/core';

export default function App() {
    return (
        <NavigationMenu.Root aria-label="Main navigation">
            <NavigationMenu.List>
                <NavigationMenu.Item>
                    <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
