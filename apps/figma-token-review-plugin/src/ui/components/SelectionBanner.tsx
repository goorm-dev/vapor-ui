import { Box, Button, Text } from '@vapor-ui/core';

import type { SelectionState } from '~/shared/schema';

type Props = {
    state: SelectionState;
    onScan: (frameId: string) => void;
};

const COPY: Record<SelectionState['kind'], string> = {
    frame: '',
    none: '프레임 1개를 선택하세요.',
    multi: '프레임 1개만 선택하세요.',
    invalid: '프레임 노드만 검사할 수 있습니다.',
};

export function SelectionBanner({ state, onScan }: Props) {
    const enabled = state.kind === 'frame';
    const label =
        state.kind === 'frame'
            ? `선택: ${state.name}`
            : state.kind === 'invalid'
              ? `${COPY.invalid} (현재: ${state.nodeType})`
              : COPY[state.kind];

    return (
        <Box className="flex flex-col gap-v-100 border-b border-v-gray-200 bg-white p-v-200">
            <Text typography="body2">{label}</Text>
            <Button
                size="md"
                color="primary"
                disabled={!enabled}
                onClick={() => state.kind === 'frame' && onScan(state.id)}
            >
                검사 시작
            </Button>
        </Box>
    );
}
