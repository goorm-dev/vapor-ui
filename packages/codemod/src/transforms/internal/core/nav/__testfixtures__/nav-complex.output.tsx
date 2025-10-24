// @ts-nocheck
import { NavigationMenu } from '@vapor-ui/core';

export default function App() {
    return (
        <NavigationMenu.Root
            size="md"
            direction="horizontal"
            className="custom-nav"
            aria-label="Navigation"
        >
            <NavigationMenu.List>
                <NavigationMenu.Item>
                    {/* TODO: The "align" prop has been removed. Please use CSS (text-align or flexbox) to customize alignment. */}
                    <NavigationMenu.Link href="/" selected>
                        Home
                    </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                    <NavigationMenu.Link href="/products" disabled>
                        Products
                    </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                    {/* TODO: The "align" prop has been removed. Please use CSS (text-align or flexbox) to customize alignment. */}
                    <NavigationMenu.Link href="/about">About</NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
