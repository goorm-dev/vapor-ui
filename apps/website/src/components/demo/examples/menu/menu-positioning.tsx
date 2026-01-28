'use client';

import { Button, HStack, Menu, Text, VStack } from '@vapor-ui/core';

export default function MenuPositioning() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    top
                </Text>
                <Menu.Root>
                    <Menu.Trigger render={<Button>상단 메뉴</Button>} />
                    <Menu.PortalPrimitive>
                        <Menu.PositionerPrimitive side="top">
                            <Menu.PopupPrimitive>
                                <Menu.Item>상단 아이템 1</Menu.Item>
                                <Menu.Item>상단 아이템 2</Menu.Item>
                                <Menu.Item>상단 아이템 3</Menu.Item>
                            </Menu.PopupPrimitive>
                        </Menu.PositionerPrimitive>
                    </Menu.PortalPrimitive>
                </Menu.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    right
                </Text>
                <Menu.Root>
                    <Menu.Trigger render={<Button>우측 메뉴</Button>} />
                    <Menu.PortalPrimitive>
                        <Menu.PositionerPrimitive side="right">
                            <Menu.PopupPrimitive>
                                <Menu.Item>우측 아이템 1</Menu.Item>
                                <Menu.Item>우측 아이템 2</Menu.Item>
                                <Menu.Item>우측 아이템 3</Menu.Item>
                            </Menu.PopupPrimitive>
                        </Menu.PositionerPrimitive>
                    </Menu.PortalPrimitive>
                </Menu.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    bottom
                </Text>
                <Menu.Root>
                    <Menu.Trigger render={<Button>하단 메뉴</Button>} />
                    <Menu.PortalPrimitive>
                        <Menu.PositionerPrimitive side="bottom">
                            <Menu.PopupPrimitive>
                                <Menu.Item>하단 아이템 1</Menu.Item>
                                <Menu.Item>하단 아이템 2</Menu.Item>
                                <Menu.Item>하단 아이템 3</Menu.Item>
                            </Menu.PopupPrimitive>
                        </Menu.PositionerPrimitive>
                    </Menu.PortalPrimitive>
                </Menu.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-16" typography="body3" foreground="hint-100">
                    left
                </Text>
                <Menu.Root>
                    <Menu.Trigger render={<Button>좌측 메뉴</Button>} />
                    <Menu.PortalPrimitive>
                        <Menu.PositionerPrimitive side="left">
                            <Menu.PopupPrimitive>
                                <Menu.Item>좌측 아이템 1</Menu.Item>
                                <Menu.Item>좌측 아이템 2</Menu.Item>
                                <Menu.Item>좌측 아이템 3</Menu.Item>
                            </Menu.PopupPrimitive>
                        </Menu.PositionerPrimitive>
                    </Menu.PortalPrimitive>
                </Menu.Root>
            </HStack>
        </VStack>
    );
}
