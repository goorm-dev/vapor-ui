import { Box, Text } from '@vapor-ui/core';

import type { EvaluateOutput } from '~/shared/schema';

type Props = {
    summary: EvaluateOutput['summary'];
};

export function EmptyState({ summary }: Props) {
    return (
        <Box className="flex flex-col items-center gap-v-100 p-v-400 text-center">
            <Text typography="body2" className="text-v-gray-600">
                위반 없음.
            </Text>
            <Text typography="body4" className="text-v-gray-500">
                검사 노드 총 {summary.total}개 · 전체 {summary.violationsCount}건 부적합 · 중요 {summary.highSeverity}건
            </Text>
        </Box>
    );
}
