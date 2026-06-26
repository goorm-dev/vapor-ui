import { useState } from 'react';

import { Box, Button, HStack, Spinner, Text, VStack } from '@vapor-ui/core';

import { ApiKeyForm } from './ApiKeyForm';
import { useApiKey } from './useApiKey';
import { useInspecting } from './useInspecting';
import { useQaSession } from './useQaSession';

const ReadyPanel = ({ inspecting, toggle }: { inspecting: 'on' | 'off'; toggle: () => void }) => {
    const { count, reset } = useQaSession();
    const [confirming, setConfirming] = useState(false);

    const onReset = () => {
        if (!confirming) {
            setConfirming(true);
            return;
        }
        void reset();
        setConfirming(false);
    };

    return (
        <Box $css={{ padding: '$200' }}>
            <VStack $css={{ gap: '$200' }}>
                <HStack $css={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text typography="heading6">QA 항목 {count}건</Text>
                    <Button
                        size="sm"
                        variant="outline"
                        colorPalette="danger"
                        disabled={count === 0}
                        onClick={onReset}
                        onBlur={() => setConfirming(false)}
                    >
                        {confirming ? '정말 삭제?' : '전체 리셋'}
                    </Button>
                </HStack>

                <Button onClick={() => toggle()}>
                    {inspecting === 'on' ? 'Vapor QA 멈춤' : 'Vapor QA 시작'}
                </Button>
            </VStack>
        </Box>
    );
};

const App = () => {
    const { status: keyStatus, errorMessage, submit } = useApiKey();
    const { status: inspecting, toggle } = useInspecting();

    if (keyStatus === 'loading') {
        return (
            <Box $css={{ padding: '$200' }}>
                <Spinner />
            </Box>
        );
    }

    if (keyStatus !== 'ready') {
        return (
            <ApiKeyForm
                verifying={keyStatus === 'verifying'}
                errorMessage={errorMessage}
                onSubmit={(key) => void submit(key)}
            />
        );
    }

    if (inspecting === 'loading') {
        return (
            <Box $css={{ padding: '$200' }}>
                <Spinner />
            </Box>
        );
    }

    if (inspecting === 'unsupported') {
        return (
            <Box $css={{ padding: '$200' }}>
                <VStack $css={{ gap: '$100' }}>
                    <Text typography="heading6">Vapor QA</Text>
                    <Text typography="body2" foreground="hint-100">
                        이 페이지에서는 Vapor QA를 사용할 수 없습니다. 일반 웹페이지에서 열어주세요.
                    </Text>
                    <Button disabled>Vapor QA 시작</Button>
                </VStack>
            </Box>
        );
    }

    return <ReadyPanel inspecting={inspecting} toggle={() => void toggle()} />;
};

export default App;
