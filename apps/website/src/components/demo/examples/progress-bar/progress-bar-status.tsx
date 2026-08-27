'use client';

import { useState } from 'react';

import { Button, ProgressBar, VStack } from '@vapor-ui/core';

export default function ProgressBarStatus() {
    const [value, setValue] = useState(42);
    const done = value === 100;

    return (
        <VStack $css={{ gap: '$300', width: '20rem' }}>
            <ProgressBar.Root value={value}>
                <ProgressBar.Label>파일 업로드</ProgressBar.Label>
                <ProgressBar.Value />
                <ProgressBar.Track>
                    <ProgressBar.Indicator />
                </ProgressBar.Track>
            </ProgressBar.Root>

            <ProgressBar.Status>{done ? '업로드 완료' : null}</ProgressBar.Status>

            <Button onClick={() => setValue(done ? 42 : 100)}>
                {done ? '되돌리기' : '완료로 보내기'}
            </Button>
        </VStack>
    );
}
