import { Box, Text } from '@vapor-ui/core';

import type { EvaluateOutput, Violation } from '~/shared/schema';
import { ViolationItem } from './ViolationItem';
import { EmptyState } from './states/EmptyState';

type Props = {
    violations: Violation[];
    summary: EvaluateOutput['summary'];
};

function weight(v: Violation): number {
    return v.count ?? v.nodeIds?.length ?? 1;
}

export function ViolationList({ violations, summary }: Props) {
    if (violations.length === 0) {
        return <EmptyState summary={summary} />;
    }

    const sorted = [...violations].sort((a, b) => {
        if (a.severity === b.severity) return weight(b) - weight(a);
        return a.severity === 'high' ? -1 : 1;
    });

    return (
        <Box>
            <Box className="px-v-200 py-v-100">
                <Text typography="body4" className="text-v-gray-600">
                    전체 {summary.total} · 부적합 {summary.violationsCount} · 중요 {summary.highSeverity}
                </Text>
            </Box>
            {sorted.map((v, i) => (
                <ViolationItem key={`${v.nodeId}-${i}`} violation={v} />
            ))}
        </Box>
    );
}
