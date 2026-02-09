'use client';

import { Box, Button, HStack, Sheet, Text, VStack } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

export default function SheetSide() {
    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    right
                </Text>
                <Sheet.Root>
                    <Sheet.Trigger render={<Button variant="outline" />}>Right</Sheet.Trigger>
                    <Sheet.Popup positionerElement={<Sheet.PositionerPrimitive side="right" />}>
                        <Box className="absolute top-2 right-2">
                            <Sheet.Close aria-label="Close sheet" className="flex">
                                <CloseOutlineIcon />
                            </Sheet.Close>
                        </Box>
                        <Sheet.Header>
                            <Sheet.Title>우측 Sheet</Sheet.Title>
                        </Sheet.Header>
                        <Sheet.Body>
                            <Sheet.Description>
                                화면 우측에서 슬라이드됩니다. (기본값)
                            </Sheet.Description>
                        </Sheet.Body>
                    </Sheet.Popup>
                </Sheet.Root>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    left
                </Text>
                <Sheet.Root>
                    <Sheet.Trigger render={<Button variant="outline" />}>Left</Sheet.Trigger>
                    <Sheet.Popup positionerElement={<Sheet.PositionerPrimitive side="left" />}>
                        <Box className="absolute top-2 right-2">
                            <Sheet.Close aria-label="Close sheet" className="flex">
                                <CloseOutlineIcon />
                            </Sheet.Close>
                        </Box>
                        <Sheet.Header>
                            <Sheet.Title>좌측 Sheet</Sheet.Title>
                        </Sheet.Header>
                        <Sheet.Body>
                            <Sheet.Description>화면 좌측에서 슬라이드됩니다.</Sheet.Description>
                        </Sheet.Body>
                    </Sheet.Popup>
                </Sheet.Root>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    top
                </Text>
                <Sheet.Root>
                    <Sheet.Trigger render={<Button variant="outline" />}>Top</Sheet.Trigger>
                    <Sheet.Popup positionerElement={<Sheet.PositionerPrimitive side="top" />}>
                        <Box className="absolute top-2 right-2">
                            <Sheet.Close aria-label="Close sheet" className="flex">
                                <CloseOutlineIcon />
                            </Sheet.Close>
                        </Box>
                        <Sheet.Header>
                            <Sheet.Title>상단 Sheet</Sheet.Title>
                        </Sheet.Header>
                        <Sheet.Body>
                            <Sheet.Description>화면 상단에서 슬라이드됩니다.</Sheet.Description>
                        </Sheet.Body>
                    </Sheet.Popup>
                </Sheet.Root>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-16" typography="body3" foreground="hint-100">
                    bottom
                </Text>
                <Sheet.Root>
                    <Sheet.Trigger render={<Button variant="outline" />}>Bottom</Sheet.Trigger>
                    <Sheet.Popup positionerElement={<Sheet.PositionerPrimitive side="bottom" />}>
                        <Box className="absolute top-2 right-2">
                            <Sheet.Close aria-label="Close sheet" className="flex">
                                <CloseOutlineIcon />
                            </Sheet.Close>
                        </Box>
                        <Sheet.Header>
                            <Sheet.Title>하단 Sheet</Sheet.Title>
                        </Sheet.Header>
                        <Sheet.Body>
                            <Sheet.Description>화면 하단에서 슬라이드됩니다.</Sheet.Description>
                        </Sheet.Body>
                    </Sheet.Popup>
                </Sheet.Root>
            </HStack>
        </VStack>
    );
}
