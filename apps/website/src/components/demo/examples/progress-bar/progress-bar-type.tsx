import { ProgressBar, VStack } from '@vapor-ui/core';

export default function ProgressBarType() {
    return (
        <VStack $css={{ gap: '$300', width: '20rem' }}>
            <ProgressBar.Root value={42}>
                <ProgressBar.Label>report.pdf 업로드</ProgressBar.Label>
                <ProgressBar.Value />
                <ProgressBar.Track />
                <ProgressBar.Description>10MB 중 4.2MB를 전송했습니다.</ProgressBar.Description>
            </ProgressBar.Root>

            <ProgressBar.Root value={42} type="error">
                <ProgressBar.Label>report.pdf 업로드</ProgressBar.Label>
                <ProgressBar.Value />
                <ProgressBar.Track />
                <ProgressBar.Description>
                    업로드에 실패했습니다. 파일이 10MB를 넘습니다.
                </ProgressBar.Description>
            </ProgressBar.Root>
        </VStack>
    );
}
