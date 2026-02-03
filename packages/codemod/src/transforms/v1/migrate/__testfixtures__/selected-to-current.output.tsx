// @ts-nocheck
import { NavigationMenu } from '@vapor-ui/core';

export const Component = ({ isActive }: { isActive: boolean }) => (
    <NavigationMenu.Root>
        <NavigationMenu.List>
            {/* shorthand */}
            <NavigationMenu.Item>
                <NavigationMenu.Link current>Home</NavigationMenu.Link>
            </NavigationMenu.Item>
            {/* true */}
            <NavigationMenu.Item>
                <NavigationMenu.Link current={true}>Dashboard</NavigationMenu.Link>
            </NavigationMenu.Item>
            {/* false */}
            <NavigationMenu.Item>
                <NavigationMenu.Link current={false}>Settings</NavigationMenu.Link>
            </NavigationMenu.Item>
            {/* expression */}
            <NavigationMenu.Item>
                <NavigationMenu.Link current={isActive}>Profile</NavigationMenu.Link>
            </NavigationMenu.Item>
        </NavigationMenu.List>
    </NavigationMenu.Root>
);
