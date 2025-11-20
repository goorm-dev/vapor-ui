import { NavigationMenu } from '@vapor-ui/core';

export default function NavigationMenuSelected() {
    return (
        <div className="space-y-4">
            <NavigationMenu.Root aria-label="Navigation with selected link">
                <NavigationMenu.List>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link href="#">홈</NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item value="1">
                        <NavigationMenu.TriggerPrimitive>
                            아이템
                            <NavigationMenu.TriggerIndicatorPrimitive />
                        </NavigationMenu.TriggerPrimitive>

                        <NavigationMenu.Content>내용물</NavigationMenu.Content>
                    </NavigationMenu.Item>
                </NavigationMenu.List>

                <NavigationMenu.PortalPrimitive>
                    <NavigationMenu.PositionerPrimitive>
                        <NavigationMenu.PopupPrimitive>
                            <NavigationMenu.ViewportPrimitive />
                        </NavigationMenu.PopupPrimitive>
                    </NavigationMenu.PositionerPrimitive>
                </NavigationMenu.PortalPrimitive>
            </NavigationMenu.Root>
        </div>
    );
}
