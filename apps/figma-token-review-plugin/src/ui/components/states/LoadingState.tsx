import { Box, Text } from '@vapor-ui/core';

export function LoadingState() {
    return (
        <Box className="flex flex-col items-center justify-center gap-v-100 p-v-400">
            <Text typography="body2">검사 중...</Text>
        </Box>
    );
}
