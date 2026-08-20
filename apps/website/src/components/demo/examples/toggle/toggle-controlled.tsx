'use client';

import { useState } from 'react';

import { HStack, Text, Toggle } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

export default function ToggleControlled() {
    const [pressed, setPressed] = useState(false);

    return (
        <HStack $css={{ gap: '$150', alignItems: 'center' }}>
            <Toggle pressed={pressed} onPressedChange={setPressed} aria-label="즐겨찾기">
                <HeartIcon />
            </Toggle>
            <Text typography="body3">State: {pressed ? 'On' : 'Off'}</Text>
        </HStack>
    );
}
