import { NavigationMenu } from '@vapor-ui/core';

export default function NavigationMenuComposition() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">기본 컴포지션 패턴</h4>
                <NavigationMenu.Root aria-label="Basic composition navigation">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="/">홈</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="/products" selected>
                                제품
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="/about">회사소개</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="/contact">연락처</NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">LinkItem 패턴 (편의 컴포넌트)</h4>
                <NavigationMenu.Root aria-label="LinkItem pattern navigation">
                    <NavigationMenu.List>
                        <NavigationMenu.LinkItem href="/">홈</NavigationMenu.LinkItem>
                        <NavigationMenu.LinkItem href="/products">제품</NavigationMenu.LinkItem>
                        <NavigationMenu.LinkItem href="/about">회사소개</NavigationMenu.LinkItem>
                        <NavigationMenu.LinkItem href="/contact">연락처</NavigationMenu.LinkItem>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </div>
        </div>
    );
}
