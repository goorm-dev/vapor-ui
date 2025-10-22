import { NavigationMenu } from '@vapor-ui/core';

export default function App() {
    return (
        <NavigationMenu.Root
            render={
                <nav>
                    <NavigationMenu.List>
                        <NavigationMenu.Item
                            render={
                                <li>
                                    <NavigationMenu.Link render={<a>Home</a>} href="/" />
                                </li>
                            }
                        />
                    </NavigationMenu.List>
                </nav>
            }
            aria-label="Navigation"
        />
    );
}
