'use client';

import { useState } from 'react';

import { HStack, Text, Toggle, ToggleGroup, VStack } from '@vapor-ui/core';
import {
    AlignCenterOutlineIcon,
    AlignLeftOutlineIcon,
    AlignRightOutlineIcon,
} from '@vapor-ui/icons';

export default function ToggleGroupControlled() {
    const [value, setValue] = useState<string[]>(['left']);
    const [value2, setValue2] = useState<string[]>(['left']);

    return (
        <HStack $css={{ gap: '$300', alignItems: 'center' }}>
            <VStack $css={{ gap: '$150' }}>
                <Text>Single</Text>
                <ToggleGroup value={value} onValueChange={setValue} aria-label="텍스트 정렬">
                    <Toggle value="left" aria-label="왼쪽 정렬">
                        <AlignLeftOutlineIcon />
                    </Toggle>
                    <Toggle value="center" aria-label="가운데 정렬">
                        <AlignCenterOutlineIcon />
                    </Toggle>
                    <Toggle value="right" aria-label="오른쪽 정렬">
                        <AlignRightOutlineIcon />
                    </Toggle>
                </ToggleGroup>
                <Text typography="body3">
                    Selected: {value.length > 0 ? value.join(', ') : 'none'}
                </Text>
            </VStack>

            <VStack $css={{ gap: '$150' }}>
                <Text>Multiple</Text>
                <ToggleGroup
                    value={value2}
                    onValueChange={setValue2}
                    aria-label="텍스트 정렬"
                    multiple
                >
                    <Toggle value="left" aria-label="왼쪽 정렬">
                        <AlignLeftOutlineIcon />
                    </Toggle>
                    <Toggle value="center" aria-label="가운데 정렬">
                        <AlignCenterOutlineIcon />
                    </Toggle>
                    <Toggle value="right" aria-label="오른쪽 정렬">
                        <AlignRightOutlineIcon />
                    </Toggle>
                </ToggleGroup>
                <Text typography="body3">
                    Selected: {value2.length > 0 ? value2.join(', ') : 'none'}
                </Text>
            </VStack>
        </HStack>
    );
}
