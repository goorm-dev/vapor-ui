'use client';

import { Button, HStack, Popover, Text, VStack } from '@vapor-ui/core';

export default function PopoverPositioning() {
    return (
        <HStack gap="$400">
            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    Side
                </Text>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        top
                    </Text>
                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            상단 팝오버
                        </Popover.Trigger>
                        <Popover.Popup
                            positionerElement={<Popover.PositionerPrimitive side="top" />}
                        >
                            <Popover.Title>상단 팝오버</Popover.Title>
                            <Popover.Description>
                                트리거 위쪽에 표시되는 팝오버입니다.
                            </Popover.Description>
                        </Popover.Popup>
                    </Popover.Root>
                </HStack>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        right
                    </Text>
                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            우측 팝오버
                        </Popover.Trigger>
                        <Popover.Popup
                            positionerElement={<Popover.PositionerPrimitive side="right" />}
                        >
                            <Popover.Title>우측 팝오버</Popover.Title>
                            <Popover.Description>
                                트리거 오른쪽에 표시되는 팝오버입니다.
                            </Popover.Description>
                        </Popover.Popup>
                    </Popover.Root>
                </HStack>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        bottom
                    </Text>
                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            하단 팝오버
                        </Popover.Trigger>
                        <Popover.Popup
                            positionerElement={<Popover.PositionerPrimitive side="bottom" />}
                        >
                            <Popover.Title>하단 팝오버</Popover.Title>
                            <Popover.Description>
                                트리거 아래쪽에 표시되는 팝오버입니다.
                            </Popover.Description>
                        </Popover.Popup>
                    </Popover.Root>
                </HStack>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        left
                    </Text>
                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            좌측 팝오버
                        </Popover.Trigger>
                        <Popover.Popup
                            positionerElement={<Popover.PositionerPrimitive side="left" />}
                        >
                            <Popover.Title>좌측 팝오버</Popover.Title>
                            <Popover.Description>
                                트리거 왼쪽에 표시되는 팝오버입니다.
                            </Popover.Description>
                        </Popover.Popup>
                    </Popover.Root>
                </HStack>
            </VStack>

            <VStack gap="$150">
                <Text typography="body3" foreground="hint-100">
                    Alignment
                </Text>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        start
                    </Text>
                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            시작점 정렬
                        </Popover.Trigger>
                        <Popover.Popup
                            positionerElement={<Popover.PositionerPrimitive align="start" />}
                        >
                            <Popover.Title>시작점 정렬</Popover.Title>
                            <Popover.Description>
                                트리거의 시작점에 정렬된 팝오버입니다.
                            </Popover.Description>
                        </Popover.Popup>
                    </Popover.Root>
                </HStack>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        center
                    </Text>
                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            중앙 정렬
                        </Popover.Trigger>
                        <Popover.Popup
                            positionerElement={<Popover.PositionerPrimitive align="center" />}
                        >
                            <Popover.Title>중앙 정렬</Popover.Title>
                            <Popover.Description>
                                트리거의 중앙에 정렬된 팝오버입니다.
                            </Popover.Description>
                        </Popover.Popup>
                    </Popover.Root>
                </HStack>
                <HStack gap="$150" alignItems="center">
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        end
                    </Text>
                    <Popover.Root>
                        <Popover.Trigger render={<Button variant="outline" />}>
                            끝점 정렬
                        </Popover.Trigger>
                        <Popover.Popup
                            positionerElement={<Popover.PositionerPrimitive align="end" />}
                        >
                            <Popover.Title>끝점 정렬</Popover.Title>
                            <Popover.Description>
                                트리거의 끝점에 정렬된 팝오버입니다.
                            </Popover.Description>
                        </Popover.Popup>
                    </Popover.Root>
                </HStack>
            </VStack>
        </HStack>
    );
}
