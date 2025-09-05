import { NavigationMenu } from '@vapor-ui/core';

export default function NavSimple() {
    return (
        <NavigationMenu.Root size="md" aria-label="Simple navigation">
            <NavigationMenu.List>
                <NavigationMenu.LinkItem href="/">홈</NavigationMenu.LinkItem>
                <NavigationMenu.LinkItem href="/products" selected>
                    제품
                </NavigationMenu.LinkItem>
                <NavigationMenu.LinkItem href="/about">회사소개</NavigationMenu.LinkItem>
                <NavigationMenu.LinkItem href="/contact" disabled>
                    연락처
                </NavigationMenu.LinkItem>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
