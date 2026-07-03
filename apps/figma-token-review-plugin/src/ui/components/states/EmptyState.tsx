import { Box, Text } from '@vapor-ui/core';

import type { EvaluateOutput } from '~/shared/schema';

type Props = { summary: EvaluateOutput['summary'] };

export function EmptyState({ summary }: Props) {
    return (
        <Box className="flex flex-col items-center gap-v-100 p-v-400">
            <Text typography="body2">위반 없음.</Text>
            <Text typography="body4" className="text-v-gray-600">
                검사 노드 총 {summary.total}개
            </Text>
        </Box>
    );
}
