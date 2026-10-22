'use client';

import { useState } from 'react';

import { HStack, Switch, Text, VStack } from '@vapor-ui/core';

export default function SwitchControlled() {
    const [checked, setChecked] = useState(false);

    return (
        <VStack $css={{ gap: '$150' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Switch.Root checked={checked} onCheckedChange={setChecked} />
                <Text typography="body3">State: {checked ? 'On' : 'Off'}</Text>
            </HStack>
        </VStack>
    );
}
