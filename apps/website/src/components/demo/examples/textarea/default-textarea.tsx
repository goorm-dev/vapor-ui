import { Box, Textarea } from '@vapor-ui/core';

export default function DefaultTextarea() {
    return (
        <Box
            $css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <Textarea placeholder="여러 줄 텍스트를 입력하세요..." />
        </Box>
    );
}
