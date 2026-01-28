'use client';

import { Button, HStack, Popover, Text, VStack } from '@vapor-ui/core';

export default function PopoverOffset() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-28" typography="body3" foreground="hint-100">
                    default
                </Text>
                <Popover.Root>
                    <Popover.Trigger render={<Button variant="outline" />}>
                        기본 오프셋
                    </Popover.Trigger>
                    <Popover.Popup>
                        <Popover.Title>기본 오프셋</Popover.Title>
                        <Popover.Description>
                            기본 8px 오프셋이 적용된 팝오버입니다.
                        </Popover.Description>
                    </Popover.Popup>
                </Popover.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-28" typography="body3" foreground="hint-100">
                    sideOffset 16
                </Text>
                <Popover.Root>
                    <Popover.Trigger render={<Button variant="outline" />}>
                        사이드 오프셋 16px
                    </Popover.Trigger>
                    <Popover.Popup
                        positionerElement={<Popover.PositionerPrimitive sideOffset={16} />}
                    >
                        <Popover.Title>사이드 오프셋 16px</Popover.Title>
                        <Popover.Description>
                            트리거로부터 16px 떨어진 팝오버입니다.
                        </Popover.Description>
                    </Popover.Popup>
                </Popover.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-28" typography="body3" foreground="hint-100">
                    alignOffset 100
                </Text>
                <Popover.Root>
                    <Popover.Trigger render={<Button variant="outline" />}>
                        정렬 오프셋 100px
                    </Popover.Trigger>
                    <Popover.Popup
                        positionerElement={<Popover.PositionerPrimitive alignOffset={1000} />}
                    >
                        <Popover.Title>정렬 오프셋 100px</Popover.Title>
                        <Popover.Description>
                            정렬 축에서 100px 이동한 팝오버입니다.
                        </Popover.Description>
                    </Popover.Popup>
                </Popover.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-28" typography="body3" foreground="hint-100">
                    combined
                </Text>
                <Popover.Root>
                    <Popover.Trigger render={<Button variant="outline" />}>
                        복합 오프셋
                    </Popover.Trigger>
                    <Popover.Popup
                        positionerElement={
                            <Popover.PositionerPrimitive sideOffset={24} alignOffset={-100} />
                        }
                    >
                        <Popover.Title>복합 오프셋</Popover.Title>
                        <Popover.Description>
                            사이드 24px, 정렬 -100px 오프셋이 적용된 팝오버입니다.
                        </Popover.Description>
                    </Popover.Popup>
                </Popover.Root>
            </HStack>
        </VStack>
    );
}
