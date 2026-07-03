import { Box, Text } from '@vapor-ui/core';

type Props = { message: string };

export function ErrorState({ message }: Props) {
    return (
        <Box className="m-v-200 rounded border border-v-red-300 bg-v-red-50 p-v-200">
            <Text typography="body2">오류: {message}</Text>
        </Box>
    );
}
