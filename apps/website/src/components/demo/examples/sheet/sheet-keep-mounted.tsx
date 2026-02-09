'use client';

import { Box, Button, HStack, Sheet, Text, TextInput, VStack } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

export default function SheetKeepMounted() {
    return (
        <VStack $styles={{ gap: '$150' }}>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    normal
                </Text>
                <Sheet.Root>
                    <Sheet.Trigger render={<Button variant="outline" />}>일반 Sheet</Sheet.Trigger>
                    <Sheet.Popup>
                        <Box className="absolute top-2 right-2">
                            <Sheet.Close aria-label="Close sheet" className="flex">
                                <CloseOutlineIcon />
                            </Sheet.Close>
                        </Box>
                        <Sheet.Header>
                            <Sheet.Title>일반 Sheet</Sheet.Title>
                        </Sheet.Header>
                        <Sheet.Body>
                            <Sheet.Description>
                                이 Sheet는 닫힐 때 DOM에서 제거됩니다. 다시 열 때마다 내용이 새로
                                생성됩니다.
                            </Sheet.Description>
                            <Box $styles={{ marginTop: '$100' }}>
                                <TextInput placeholder="입력해보세요..." />
                            </Box>
                        </Sheet.Body>
                    </Sheet.Popup>
                </Sheet.Root>
            </HStack>
            <HStack $styles={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-20" typography="body3" foreground="hint-100">
                    keepMounted
                </Text>
                <Sheet.Root>
                    <Sheet.Trigger render={<Button variant="outline" colorPalette="success" />}>
                        유지 Sheet
                    </Sheet.Trigger>
                    <Sheet.Popup portalElement={<Sheet.PortalPrimitive keepMounted />}>
                        <Box className="absolute top-2 right-2">
                            <Sheet.Close aria-label="Close sheet" className="flex">
                                <CloseOutlineIcon />
                            </Sheet.Close>
                        </Box>
                        <Sheet.Header>
                            <Sheet.Title>유지되는 Sheet</Sheet.Title>
                        </Sheet.Header>
                        <Sheet.Body>
                            <Sheet.Description>
                                이 Sheet는 닫혀도 DOM에 유지됩니다. 입력한 내용이 보존되는 것을
                                확인해보세요.
                            </Sheet.Description>
                            <Box $styles={{ marginTop: '$100' }}>
                                <TextInput placeholder="상태 보존 테스트..." />
                            </Box>
                        </Sheet.Body>
                    </Sheet.Popup>
                </Sheet.Root>
            </HStack>
        </VStack>
    );
}
