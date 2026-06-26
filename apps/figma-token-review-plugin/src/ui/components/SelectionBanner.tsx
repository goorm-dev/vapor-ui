import { Box, Button, Text } from '@vapor-ui/core';

import surveyUrl from '~/ui/assets/survey.svg';

type Props = {
    disabled: boolean;
    onAttemptScan: () => void;
};

export function SelectionBanner({ disabled, onAttemptScan }: Props) {
    return (
        <Box className="flex flex-col items-center bg-white">
            <Box className="flex flex-col items-center gap-[20px] pt-[120px]">
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
                                검수할 프레임을 선택해 주세요
                            </Text>
                            <Box className="flex flex-col items-center">
                                <Text typography="body2" foreground="hint-100">
                                    프레임을 선택하고 검수 하기 버튼을 누르면
                                </Text>
                                <Text typography="body2" foreground="hint-100">
                                    토큰 검수가 시작됩니다.
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Button
                    size="md"
                    colorPalette="primary"
                    variant="fill"
                    disabled={disabled}
                    onClick={onAttemptScan}
                >
                    검수 시작하기
                </Button>
            </Box>
        </Box>
    );
}
