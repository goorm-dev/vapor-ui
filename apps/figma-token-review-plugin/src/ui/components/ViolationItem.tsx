import { useState } from 'react';
import { Box, Button, Text } from '@vapor-ui/core';

import type { Violation } from '~/shared/schema';
import { postToCode } from '~/ui/messaging';
import { NodeRow } from './NodeRow';

const SEVERITY_LABEL: Record<Violation['severity'], string> = { high: '부적합', info: '안내' };

type Props = {
    violation: Violation;
};

export function ViolationItem({ violation }: Props) {
    const [open, setOpen] = useState<boolean>(false);
    const nodes = violation.nodeIds && violation.nodeIds.length > 0 ? violation.nodeIds : [violation.nodeId];
    const count = violation.count ?? nodes.length;

    return (
        <Box className="border-b border-v-gray-200 bg-white">
            <button
                type="button"
                className="flex w-full flex-col gap-v-050 p-v-200 text-left hover:bg-v-gray-50"
                onClick={() => setOpen((v) => !v)}
            >
                <Box className="flex items-center gap-v-100">
                    <Text typography="body4" className="rounded bg-v-red-100 px-v-050 text-v-red-700">
                        {SEVERITY_LABEL[violation.severity]}
                    </Text>
                    <Text typography="body4" className="text-v-gray-500">
                        {violation.type}
                    </Text>
                    <Text typography="body4" className="ml-auto text-v-gray-500">
                        {count}건
                    </Text>
                </Box>
                <Text typography="body2">
                    {violation.name}
                    {violation.token ? ` · ${violation.token}` : ''}
                </Text>
                <Text typography="body3" className="text-v-gray-600">
                    {violation.detail}
                </Text>
            </button>
            {open && (
                <Box className="bg-v-gray-50 px-v-200 pb-v-200 pt-v-100">
                    {violation.suggested.length > 0 && (
                        <Box className="mb-v-100 flex flex-wrap gap-v-050">
                            <Text typography="body4" className="text-v-gray-600">추천:</Text>
                            {violation.suggested.map((s) => (
                                <Text
                                    key={s}
                                    typography="body4"
                                    className="rounded bg-white px-v-100 py-v-050 font-mono text-v-gray-700"
                                >
                                    {s}
                                </Text>
                            ))}
                        </Box>
                    )}
                    <Box className="overflow-hidden rounded border border-v-gray-200 bg-white">
                        <Button
                            size="sm"
                            variant="ghost"
                            colorPalette="primary"
                            className="w-full"
                            onClick={() => postToCode({ type: 'focus', nodeIds: nodes })}
                        >
                            모두 포커스 ({nodes.length})
                        </Button>
                        {nodes.map((id, i) => (
                            <NodeRow
                                key={id + i}
                                nodeId={id}
                                index={i}
                                onClick={() => postToCode({ type: 'focus', nodeIds: [id] })}
                            />
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
