import { NavigationMenu, VStack } from '@vapor-ui/core';

export default function NavigationMenuSelected() {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium mb-2">선택된 상태 표시</h4>
                <NavigationMenu.Root
                    defaultValue={'item1'}
                    aria-label="Navigation with selected link"
                >
                    <NavigationMenu.List>
                        <NavigationMenu.Item value="item1">
                            <NavigationMenu.TriggerPrimitive>
                                아이템 1
                                <NavigationMenu.TriggerIndicatorPrimitive />
                            </NavigationMenu.TriggerPrimitive>

                            <NavigationMenu.Content>
                                <VStack>내용물 1</VStack>
                            </NavigationMenu.Content>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item value="item2">
                            <NavigationMenu.TriggerPrimitive>
                                아이템 2
                                <NavigationMenu.TriggerIndicatorPrimitive />
                            </NavigationMenu.TriggerPrimitive>

                            <NavigationMenu.Content>
                                <VStack>내용물 2</VStack>
                            </NavigationMenu.Content>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item value="item3">
                            <NavigationMenu.TriggerPrimitive>
                                아이템 3
                                <NavigationMenu.TriggerIndicatorPrimitive />
                            </NavigationMenu.TriggerPrimitive>

                            <NavigationMenu.Content>
                                <VStack>내용물 3</VStack>
                            </NavigationMenu.Content>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>

                    <NavigationMenu.Viewport
                        portalElement={<NavigationMenu.PortalPrimitive keepMounted />}
                    />
                </NavigationMenu.Root>
            </div>
        </div>
    );
}
