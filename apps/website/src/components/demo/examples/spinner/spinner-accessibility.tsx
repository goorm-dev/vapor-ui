'use client';

import { useState } from 'react';

import { Button, HStack, Spinner, Text } from '@vapor-ui/core';

export default function SpinnerAccessibility() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

    const startLoading = () => {
        setStatus('loading');
        setTimeout(() => setStatus('done'), 3000);
    };

    return (
        <HStack $css={{ gap: '$300', alignItems: 'center' }}>
            <Button onClick={startLoading} disabled={status === 'loading'}>
                데이터 불러오기
            </Button>

            {/* role="status" 컨테이너를 항상 렌더링해 두어야 내용 변화가 스크린리더에 발화됩니다 */}
            <div role="status">
                {status === 'loading' && (
                    <HStack $css={{ gap: '$100', alignItems: 'center' }}>
                        <Spinner />
                        <Text>데이터를 불러오는 중입니다…</Text>
                    </HStack>
                )}
                {status === 'done' && <Text>불러오기가 완료되었습니다.</Text>}
            </div>
        </HStack>
    );
}
