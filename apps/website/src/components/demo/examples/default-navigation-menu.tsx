import { NavigationMenu } from '@vapor-ui/core';

export default function DefaultNavigationMenu() {
    return (
        <NavigationMenu.Root size="md" aria-label="Navigation menu">
            <NavigationMenu.List>
                <NavigationMenu.Item>
                    <NavigationMenu.Link href="#">Default Link</NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                    <NavigationMenu.Link href="#" selected>
                        Selected Link
                    </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                    <NavigationMenu.Link href="#" disabled>
                        Disabled Link
                    </NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
