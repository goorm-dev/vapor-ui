import { ProgressBar } from '@vapor-ui/core';

export default function DefaultProgressBar() {
    return (
        <ProgressBar.Root value={42} $css={{ width: '20rem' }}>
            <ProgressBar.Label>파일 업로드</ProgressBar.Label>
            <ProgressBar.Value />
            <ProgressBar.Track />
        </ProgressBar.Root>
    );
}
