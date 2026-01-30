'use client';

import { HStack, IconButton, Text, Tooltip, VStack } from '@vapor-ui/core';
import {
    AlignCenterOutlineIcon,
    AlignJustifyOutlineIcon,
    AlignLeftOutlineIcon,
    AlignRightOutlineIcon,
} from '@vapor-ui/icons';

export default function TooltipPopup() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    왼쪽 정렬
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<IconButton aria-label="왼쪽 정렬" />}>
                        <AlignLeftOutlineIcon />
                    </Tooltip.Trigger>
                    <Tooltip.Popup>왼쪽 정렬</Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    중앙 정렬
                </Text>
                <Tooltip.Root>
                    <Tooltip.Trigger render={<IconButton aria-label="중앙 정렬" />}>
                        <AlignCenterOutlineIcon />
                    </Tooltip.Trigger>
                    <Tooltip.Popup>중앙 정렬</Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    오른쪽 정렬
                </Text>

                <Tooltip.Root>
                    <Tooltip.Trigger render={<IconButton aria-label="오른쪽 정렬" />}>
                        <AlignRightOutlineIcon />
                    </Tooltip.Trigger>
                    <Tooltip.Popup>오른쪽 정렬</Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-24" typography="body3" foreground="hint-100">
                    양쪽 정렬
                </Text>

                <Tooltip.Root>
                    <Tooltip.Trigger render={<IconButton aria-label="양쪽 정렬" />}>
                        <AlignJustifyOutlineIcon />
                    </Tooltip.Trigger>
                    <Tooltip.Popup>양쪽 정렬</Tooltip.Popup>
                </Tooltip.Root>
            </HStack>
        </VStack>
    );
}
