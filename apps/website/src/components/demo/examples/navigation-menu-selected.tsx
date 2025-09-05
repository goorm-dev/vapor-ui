import { NavigationMenu } from '@vapor-ui/core';

export default function NavSelected() {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium mb-2">선택된 상태 표시</h4>
                <NavigationMenu.Root aria-label="Navigation with selected link">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">홈</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" selected>
                                제품 (선택됨)
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
