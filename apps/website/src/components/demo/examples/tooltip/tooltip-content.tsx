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
        <VStack gap="$200">
            <Text typography="heading5">정렬</Text>

            <HStack gap="$100">
                <Tooltip.Root>
                    <Tooltip.Trigger render={<IconButton aria-label="왼쪽 정렬" />}>
                        <AlignLeftOutlineIcon />
                    </Tooltip.Trigger>
                    <Tooltip.Popup>왼쪽 정렬</Tooltip.Popup>
                </Tooltip.Root>

                <Tooltip.Root>
                    <Tooltip.Trigger render={<IconButton aria-label="중앙 정렬" />}>
                        <AlignCenterOutlineIcon />
                    </Tooltip.Trigger>
                    <Tooltip.Popup>중앙 정렬</Tooltip.Popup>
                </Tooltip.Root>

                <Tooltip.Root>
                    <Tooltip.Trigger render={<IconButton aria-label="오른쪽 정렬" />}>
                        <AlignRightOutlineIcon />
                    </Tooltip.Trigger>
                    <Tooltip.Popup>오른쪽 정렬</Tooltip.Popup>
                </Tooltip.Root>

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
