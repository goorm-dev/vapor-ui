'use client';

import { Box, Button, HStack, Sheet, Text, VStack } from '@vapor-ui/core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

type Side = 'right' | 'left' | 'top' | 'bottom';

type Case = {
    side: Side;
    label: string;
    description: string;
    min: number;
    max: number;
    def: number;
};

const CASES: Case[] = [
    {
        side: 'right',
        label: 'right',
        description: '우측 Sheet입니다. 왼쪽 가장자리 핸들을 잡고 좌우로 끌어 너비를 조절하세요.',
        min: 300,
        max: 640,
        def: 300,
    },
    {
        side: 'left',
        label: 'left',
        description: '좌측 Sheet입니다. 오른쪽 가장자리 핸들을 잡고 좌우로 끌어 너비를 조절하세요.',
        min: 300,
        max: 640,
        def: 300,
    },
    {
        side: 'top',
        label: 'top',
        description:
            '상단 Sheet입니다. 아래쪽 가장자리 핸들을 잡고 위아래로 끌어 높이를 조절하세요.',
        min: 200,
        max: 560,
        def: 360,
    },
    {
        side: 'bottom',
        label: 'bottom',
        description: '하단 Sheet입니다. 위쪽 가장자리 핸들을 잡고 위아래로 끌어 높이를 조절하세요.',
        min: 200,
        max: 560,
        def: 360,
    },
];

export default function ResizableSheet() {
    return (
        <VStack $css={{ gap: '$150' }}>
            {CASES.map(({ side, label, description, min, max, def }) => (
                <HStack key={side} $css={{ gap: '$150', alignItems: 'center' }}>
                    <Text className="w-16" typography="body3" foreground="hint-100">
                        {label}
                    </Text>
                    <Sheet.Root minSize={min} maxSize={max} defaultSize={def}>
                        <Sheet.Trigger render={<Button variant="outline" />}>{label}</Sheet.Trigger>
                        <Sheet.PortalPrimitive>
                            <Sheet.OverlayPrimitive />
                            <Sheet.PositionerPrimitive side={side}>
                                <Sheet.PopupPrimitive>
                                    <Sheet.ResizeHandle />
                                    <Box className="absolute top-2 right-2">
                                        <Sheet.Close aria-label="Close sheet" className="flex">
                                            <CloseOutlineIcon />
                                        </Sheet.Close>
                                    </Box>
                                    <Sheet.Header>
                                        <Sheet.Title>크기 조절 가능한 Sheet ({label})</Sheet.Title>
                                    </Sheet.Header>
                                    <Sheet.Body>
                                        <Sheet.Description>{description}</Sheet.Description>
                                    </Sheet.Body>
                                </Sheet.PopupPrimitive>
                            </Sheet.PositionerPrimitive>
                        </Sheet.PortalPrimitive>
                    </Sheet.Root>
                </HStack>
            ))}
        </VStack>
    );
}
