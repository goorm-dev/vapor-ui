import { NavigationMenu } from '@vapor-ui/core';

export default function App() {
    return (
        <>
            <NavigationMenu.Root aria-label="Navigation">
                <NavigationMenu.List>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
                    </NavigationMenu.Item>
                </NavigationMenu.List>
            </NavigationMenu.Root>
            {/* TODO: The "type" prop has been removed. Please use CSS to customize the navigation style. */}
            <NavigationMenu.Root aria-label="Navigation">
                <NavigationMenu.List>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link href="/about" selected>
                            About
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                </NavigationMenu.List>
            </NavigationMenu.Root>
        </>
    );
}
