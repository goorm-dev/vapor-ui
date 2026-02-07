'use client';

import { Button, HStack, Menu, Text, VStack } from '@vapor-ui/core';

export default function MenuDisabled() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-28" typography="body3" foreground="hint-100">
                    disabled item
                </Text>
                <Menu.Root>
                    <Menu.Trigger render={<Button>일반 메뉴</Button>} />
                    <Menu.Popup>
                        <Menu.Item>활성 아이템 1</Menu.Item>
                        <Menu.Item disabled>비활성 아이템</Menu.Item>
                        <Menu.Item>활성 아이템 2</Menu.Item>
                        <Menu.Separator />
                        <Menu.Item disabled>비활성 아이템 2</Menu.Item>
                        <Menu.Item>활성 아이템 3</Menu.Item>
                    </Menu.Popup>
                </Menu.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-28" typography="body3" foreground="hint-100">
                    disabled menu
                </Text>
                <Menu.Root disabled>
                    <Menu.Trigger render={<Button>비활성 메뉴</Button>} />
                    <Menu.Popup>
                        <Menu.Item>아이템 1</Menu.Item>
                        <Menu.Item>아이템 2</Menu.Item>
                        <Menu.Item>아이템 3</Menu.Item>
                    </Menu.Popup>
                </Menu.Root>
            </HStack>
        </VStack>
    );
}
