'use client';

import { useState } from 'react';

import { Box, Button, HStack, Sheet, Text, VStack } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

export default function SheetControlled() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <VStack gap="$150" alignItems="flex-start">
            <HStack gap="$100">
                <Button onClick={() => setIsOpen(true)} colorPalette="primary">
                    Sheet 열기
                </Button>
                <Button onClick={() => setIsOpen(false)} colorPalette="danger" variant="outline">
                    Sheet 닫기
                </Button>
            </HStack>

            <Text typography="body3" foreground="hint-100">
                현재 상태: <strong>{isOpen ? '열림' : '닫힘'}</strong>
            </Text>

            <Sheet.Root open={isOpen} onOpenChange={setIsOpen}>
                <Sheet.Popup>
                    <Box position="absolute" top="$100" right="$100">
                        <Sheet.Close aria-label="Close sheet" className="flex">
                            <CloseOutlineIcon />
                        </Sheet.Close>
                    </Box>
                    <Sheet.Header>
                        <Sheet.Title>제어된 Sheet</Sheet.Title>
                    </Sheet.Header>
                    <Sheet.Body>
                        <Sheet.Description>
                            이 Sheet는 외부 버튼으로 상태가 제어됩니다. 프로그래밍 방식으로
                            열림/닫힘을 관리할 수 있습니다.
                        </Sheet.Description>
                    </Sheet.Body>
                    <Sheet.Footer>
                        <Sheet.Close render={<Button variant="ghost" />}>닫기</Sheet.Close>
                    </Sheet.Footer>
                </Sheet.Popup>
            </Sheet.Root>
        </VStack>
    );
}
