'use client';

import { useState } from 'react';

import { Button, ProgressBar, VStack } from '@vapor-ui/core';

export default function ProgressBarDescription() {
    const [failed, setFailed] = useState(false);

    return (
        <VStack $css={{ gap: '$300', width: '20rem' }}>
            <ProgressBar.Root value={42} type={failed ? 'error' : 'default'}>
                <ProgressBar.Label>report.pdf 업로드</ProgressBar.Label>
                <ProgressBar.Value />
                <ProgressBar.Track>
                    <ProgressBar.Indicator />
                </ProgressBar.Track>
                <ProgressBar.Description>
                    {failed
                        ? '업로드에 실패했습니다. 파일이 10MB를 넘습니다.'
                        : '10MB 중 4.2MB를 전송했습니다.'}
                </ProgressBar.Description>
            </ProgressBar.Root>

            <Button onClick={() => setFailed((prev) => !prev)}>
                {failed ? '되돌리기' : '실패로 보내기'}
            </Button>
        </VStack>
    );
}
