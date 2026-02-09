import { HStack, NavigationMenu, Text, VStack } from '@vapor-ui/core';

export default function NavigationMenuSize() {
    return (
        <VStack $styles={{ gap: '$200' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <NavigationMenu.Root size="sm" aria-label="Small navigation">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">Home</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" current>
                                About
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <NavigationMenu.Root size="md" aria-label="Medium navigation">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">Home</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" current>
                                About
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <NavigationMenu.Root size="lg" aria-label="Large navigation">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">Home</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" current>
                                About
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </HStack>

            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <NavigationMenu.Root size="xl" aria-label="Extra large navigation">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#">Home</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" current>
                                About
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </HStack>
        </VStack>
    );
}
