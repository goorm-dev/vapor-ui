import { ProgressBar } from '@vapor-ui/core';

export default function ProgressBarIndeterminate() {
    return (
        <ProgressBar.Root value={null} $css={{ width: '20rem' }}>
            <ProgressBar.Label>서버 응답 대기 중</ProgressBar.Label>
            <ProgressBar.Value>{() => '처리 중'}</ProgressBar.Value>
            <ProgressBar.Track>
                <ProgressBar.Indicator />
            </ProgressBar.Track>
        </ProgressBar.Root>
    );
}
