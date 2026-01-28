'use client';

import { Button, HStack, Text, Tooltip, VStack } from '@vapor-ui/core';

export default function TooltipPopup() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    simple
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<Button>간단한 텍스트</Button>} />
                    <Tooltip.Popup>간단한 툴팁 메시지</Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    long text
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<Button>긴 텍스트</Button>} />
                    <Tooltip.Popup>
                        이것은 더 긴 툴팁 메시지입니다. 여러 줄에 걸쳐 표시될 수 있으며 유용한
                        정보를 제공합니다.
                    </Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    formatted
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<Button>포맷된 텍스트</Button>} />
                    <Tooltip.Popup>
                        <VStack gap="$50">
                            <Text typography="body3" className="font-bold">
                                제목
                            </Text>
                            <Text typography="body3">설명 텍스트가 여기에 있습니다.</Text>
                            <Text typography="body4" foreground="hint-100">
                                추가 정보
                            </Text>
                        </VStack>
                    </Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    shortcut
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<Button>키보드 단축키</Button>} />
                    <Tooltip.Popup>
                        <HStack gap="$100" alignItems="center">
                            <Text typography="body3">저장하기</Text>
                            <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 rounded">Ctrl+S</kbd>
                        </HStack>
                    </Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
        </VStack>
    );
}
