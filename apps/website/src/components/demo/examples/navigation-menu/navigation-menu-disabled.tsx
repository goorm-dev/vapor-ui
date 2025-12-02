import { NavigationMenu } from '@vapor-ui/core';

export default function NavigationMenuDisabled() {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium mb-2">기본 상태와 비활성화 상태</h4>
                <NavigationMenu.Root aria-label="Navigation with disabled links">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">활성 링크</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" disabled>
                                비활성화 링크
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">다른 활성 링크</NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">선택된 상태와 비활성화 상태</h4>
                <NavigationMenu.Root aria-label="Navigation with selected and disabled">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">홈</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" selected>
                                선택된 링크
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" disabled>
                                비활성화 링크
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">연락처</NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </div>
        </div>
    );
}
