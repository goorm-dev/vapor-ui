import { Box, Button, Text } from '@vapor-ui/core';

import confirmUrl from '~/ui/assets/confirm.svg';

type Props = {
    onReset: () => void;
};

export function SuccessState({ onReset }: Props) {
    return (
        <Box className="flex flex-col items-center bg-white">
            <Box className="flex flex-col items-center gap-[20px] pt-[120px]">
                <Box className="flex flex-col items-center justify-center gap-[8px]">
                    <Box className="flex h-[120px] w-[160px] items-center justify-center">
                        <img
                            alt=""
                            src={confirmUrl}
                            className="block h-full w-full object-contain"
                        />
                    </Box>
                    <Box className="flex flex-col items-center gap-[20px]">
                        <Box className="flex flex-col items-center gap-[4px] text-center">
                            <Text typography="heading5" foreground="normal-200">
                                모든 토큰이 올바르게 사용되었어요
                            </Text>
                            <Box className="flex flex-col items-center">
                                <Text typography="body2" foreground="hint-100">
                                    선택한 프레임의 모든 토큰이
                                </Text>
                                <Text typography="body2" foreground="hint-100">
                                    올바르게 사용되었습니다.
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Button size="md" colorPalette="primary" variant="fill" onClick={onReset}>
                    다른 프레임 검수하기
                </Button>
            </Box>
        </Box>
    );
}
