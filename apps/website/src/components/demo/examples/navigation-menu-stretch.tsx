import { NavigationMenu } from '@vapor-ui/core';

export default function NavigationMenuStretch() {
    return (
        <div className="space-y-4 w-full">
            <div>
                <h4 className="text-sm font-medium mb-2">Default (stretch=false)</h4>
                <NavigationMenu.Root aria-label="Default navigation">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">홈</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" selected>
                                제품
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">서비스</NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Stretch (stretch=true)</h4>
                <NavigationMenu.Root stretch aria-label="Stretched navigation">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">홈</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" selected>
                                제품
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">서비스</NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </div>
        </div>
    );
}
