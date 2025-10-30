import { NavigationMenu } from '@vapor-ui/core';

export default function App() {
    const navProps = { size: 'lg', stretch: true };
    const linkProps = { href: '/', active: true };

    return (
        <NavigationMenu.Root {...navProps} aria-label="Navigation">
            <NavigationMenu.List>
                <NavigationMenu.Item>
                    <NavigationMenu.Link {...linkProps}>Home</NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
