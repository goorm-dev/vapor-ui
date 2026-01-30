import { NavigationMenu } from '@vapor-ui/core';

export default function NavigationMenuCurrent() {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium mb-2">현재 페이지 표시</h4>
                <NavigationMenu.Root aria-label="Navigation with current page">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">홈</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" current>
                                제품 (현재 페이지)
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">서비스</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">회사소개</NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </div>
        </div>
    );
}
