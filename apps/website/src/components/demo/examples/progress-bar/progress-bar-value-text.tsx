import { ProgressBar, VStack } from '@vapor-ui/core';

export default function ProgressBarValueText() {
    return (
        <VStack $css={{ gap: '$300', width: '20rem' }}>
            <ProgressBar.Root value={15} min={10} max={20}>
                <ProgressBar.Label>디스크 검사</ProgressBar.Label>
                <ProgressBar.Value />
                <ProgressBar.Track>
                    <ProgressBar.Indicator />
                </ProgressBar.Track>
            </ProgressBar.Root>

            <ProgressBar.Root
                value={3}
                max={8}
                getAriaValueText={(_, value) => `8개 중 ${value}개`}
            >
                <ProgressBar.Label>파일 업로드</ProgressBar.Label>
                <ProgressBar.Value />
                <ProgressBar.Track>
                    <ProgressBar.Indicator />
                </ProgressBar.Track>
            </ProgressBar.Root>
        </VStack>
    );
}
