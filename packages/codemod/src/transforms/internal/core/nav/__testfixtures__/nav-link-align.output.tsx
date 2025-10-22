import { NavigationMenu } from '@vapor-ui/core';

export default function App() {
    return (
        <NavigationMenu.Root aria-label="Navigation">
            <NavigationMenu.List>
                <NavigationMenu.Item>
                    {/* TODO: The "align" prop has been removed. Please use CSS (text-align or flexbox) to customize alignment. */}
                    <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
