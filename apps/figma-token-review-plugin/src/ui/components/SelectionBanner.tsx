import { Box, Button, Text } from '@vapor-ui/core';

import type { SelectionState } from '~/shared/schema';
import surveyUrl from '~/ui/assets/survey.svg';

type Props = {
    state: SelectionState;
    onScan: (frameId: string) => void;
};

type Copy = { title: string; subtitle: string[] };

function copyFor(state: SelectionState): Copy {
    switch (state.kind) {
        case 'frame':
            return {
                title: `선택된 프레임: ${state.name}`,
                subtitle: ['검수 시작하기 버튼을 누르면', '토큰 검수가 시작됩니다.'],
            };
        case 'none':
            return {
                title: '검수할 프레임을 선택해 주세요',
                subtitle: ['프레임을 선택하고 검수 하기 버튼을 누르면', '토큰 검수가 시작됩니다.'],
            };
        case 'multi':
            return {
                title: '프레임 한 개만 선택해 주세요',
                subtitle: ['여러 프레임은 한 번에', '검수할 수 없습니다.'],
            };
        case 'invalid':
            return {
                title: '프레임 노드만 검사할 수 있습니다',
                subtitle: [`현재 선택: ${state.nodeType}`, '프레임을 선택해 주세요.'],
            };
    }
}

export function SelectionBanner({ state, onScan }: Props) {
    const enabled = state.kind === 'frame';
    const { title, subtitle } = copyFor(state);

    return (
        <Box className="flex flex-col items-center bg-white pt-[120px]">
            <Box className="flex flex-col items-center justify-center gap-[8px]">
                <Box className="h-[120px] w-[160px] overflow-hidden">
                    <img
                        alt=""
                        src={surveyUrl}
                        className="block h-full w-full object-contain"
                    />
                </Box>
                <Box className="flex flex-col items-center gap-[20px]">
                    <Box className="flex flex-col items-center gap-[4px] text-center">
                        <Text typography="heading5" foreground="normal-200">
                            {title}
                        </Text>
                        <Box className="flex flex-col items-center">
                            {subtitle.map((line) => (
                                <Text key={line} typography="body2" foreground="hint-100">
                                    {line}
                                </Text>
                            ))}
                        </Box>
                    </Box>
                    <Button
                        size="md"
                        colorPalette="primary"
                        variant="fill"
                        disabled={!enabled}
                        onClick={() => state.kind === 'frame' && onScan(state.id)}
                    >
                        검수 시작하기
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
