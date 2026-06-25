import { Box } from '@vapor-ui/core';

import type { EvaluateOutput, Violation } from '~/shared/schema';
import { ViolationItem } from './ViolationItem';
import { EmptyState } from './states/EmptyState';

type Props = {
    violations: Violation[];
    summary: EvaluateOutput['summary'];
};

function weight(v: Violation): number {
    const base = v.severity === 'high' ? 1_000_000 : 0;
    return base + (v.count ?? v.nodeIds?.length ?? 1);
}

export function ViolationList({ violations, summary }: Props) {
    if (violations.length === 0) {
        return <EmptyState summary={summary} />;
    }

    const sorted = [...violations].sort((a, b) => weight(b) - weight(a));

    return (
        <Box className="flex flex-col">
            {sorted.map((v, i) => (
                <ViolationItem key={v.nodeId + v.type + i} violation={v} />
            ))}
        </Box>
    );
}
