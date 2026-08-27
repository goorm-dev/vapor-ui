import { ProgressBar, VStack } from '@vapor-ui/core';

export default function ProgressBarType() {
    return (
        <VStack $css={{ gap: '$300', width: '20rem' }}>
            <ProgressBar.Root value={42} type="default">
                <ProgressBar.Label>파일 업로드</ProgressBar.Label>
                <ProgressBar.Value />
                <ProgressBar.Track>
                    <ProgressBar.Indicator />
                </ProgressBar.Track>
            </ProgressBar.Root>

            <ProgressBar.Root value={42} type="warning">
                <ProgressBar.Label>남은 저장 공간</ProgressBar.Label>
                <ProgressBar.Value />
                <ProgressBar.Track>
                    <ProgressBar.Indicator />
                </ProgressBar.Track>
            </ProgressBar.Root>
        </VStack>
    );
}
