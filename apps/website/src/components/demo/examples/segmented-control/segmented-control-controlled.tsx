import { useState } from 'react';

import { Button, HStack, SegmentedControl, VStack } from '@vapor-ui/core';
import { DarkIcon, LightIcon, PcIcon } from '@vapor-ui/icons';

export default function DefaultSegmentedControl() {
    const [mode, setMode] = useState('light');

    return (
        <VStack $css={{ gap: '$150' }}>
            현재 모드: {mode}
            <SegmentedControl.Root value={mode} onValueChange={setMode} aria-label="테마 모드 선택">
                <SegmentedControl.Item value="light">
                    <LightIcon />
                    Light
                </SegmentedControl.Item>
                <SegmentedControl.Item value="dark">
                    <DarkIcon />
                    Dark
                </SegmentedControl.Item>
                <SegmentedControl.Item value="system">
                    <PcIcon />
                    System
                </SegmentedControl.Item>
            </SegmentedControl.Root>
            <HStack $css={{ gap: '$100' }}>
                <Button onClick={() => setMode('light')}>라이트 모드</Button>
                <Button onClick={() => setMode('dark')}>다크 모드</Button>
                <Button onClick={() => setMode('system')}>시스템 모드</Button>
            </HStack>
        </VStack>
    );
}
