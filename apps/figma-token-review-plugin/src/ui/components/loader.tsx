import { Box, Spinner, Text } from '@vapor-ui/core';
import { TimeOutlineIcon } from '@vapor-ui/icons';

import type { LoadingProgress } from '../features/scan';

type PhaseKey = 'extract' | 'thinking' | 'finalizing';

export type LoaderProps = {
    progress?: LoadingProgress;
};

export function Loader({ progress }: LoaderProps) {
    const phase = currentPhase(progress);

    return (
        <Box className="flex min-h-screen flex-col items-center justify-center p-v-400">
            <Box className="flex w-57.5 flex-col items-center gap-v-200">
                <Box className="flex w-full flex-col items-center gap-v-150">
                    <Spinner size="lg" colorPalette="primary" />
                    <Text typography="body2" foreground="normal-200">
                        {statusText(phase)}
                    </Text>
                </Box>
                <Box className="flex items-center gap-1">
                    <TimeOutlineIcon size={14} color="var(--vapor-color-foreground-hint-100)" />
                    <Text typography="body3" foreground="hint-100">
                        {estimateText(progress)}
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}

function statusText(phase: PhaseKey): string {
    switch (phase) {
        case 'extract':
            return '피그마 노드 추출 중...';
        case 'thinking':
            return 'AI 검사 중...';
        case 'finalizing':
            return '결과 정리 중...';
    }
}

function currentPhase(progress: LoadingProgress | undefined): PhaseKey {
    if (!progress || !progress.llm) return 'extract';
    return progress.llm.phase;
}

function estimateText(progress: LoadingProgress | undefined): string {
    const ms = progress?.llm?.estimatedDurationMs;
    if (typeof ms !== 'number') return '예상시간: 계산 중...';
    return `예상시간: 약 ${formatDuration(ms)}`;
}

function formatDuration(ms: number): string {
    const seconds = Math.max(1, Math.round(ms / 1000));
    if (seconds < 60) return `${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    const rem = seconds % 60;
    if (rem === 0) return `${minutes}분`;
    return `${minutes}분 ${rem}초`;
}
