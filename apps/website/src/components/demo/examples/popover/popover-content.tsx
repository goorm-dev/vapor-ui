'use client';

import { Button, HStack, Popover, Text, VStack } from '@vapor-ui/core';

export default function PopoverPopup() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    text
                </Text>
                <Popover.Root>
                    <Popover.Trigger render={<Button variant="outline" />}>
                        간단한 텍스트
                    </Popover.Trigger>
                    <Popover.Popup>간단한 팝오버 메시지입니다.</Popover.Popup>
                </Popover.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    title + desc
                </Text>
                <Popover.Root>
                    <Popover.Trigger render={<Button variant="outline" />}>
                        제목과 설명
                    </Popover.Trigger>
                    <Popover.Popup>
                        <Popover.Title>알림</Popover.Title>
                        <Popover.Description>
                            새로운 업데이트가 있습니다. 확인해보세요.
                        </Popover.Description>
                    </Popover.Popup>
                </Popover.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    interactive
                </Text>
                <Popover.Root>
                    <Popover.Trigger render={<Button variant="outline" />}>
                        상호작용 콘텐츠
                    </Popover.Trigger>
                    <Popover.Popup>
                        <Popover.Title>설정</Popover.Title>
                        <Popover.Description>원하는 설정을 선택하세요.</Popover.Description>
                        <VStack gap="$100" marginTop="$100">
                            <Button size="sm" className="w-full">
                                옵션 1
                            </Button>
                            <Button size="sm" variant="outline" className="w-full">
                                옵션 2
                            </Button>
                        </VStack>
                    </Popover.Popup>
                </Popover.Root>
            </HStack>
        </VStack>
    );
}
