import { Box, Textarea } from '@vapor-ui/core';

export default function DefaultTextarea() {
    return (
        <Box display="felx" alignItems="center" justifyContent="center">
            <Textarea.Root placeholder="여러 줄 텍스트를 입력하세요...">
                <Textarea.Field />
            </Textarea.Root>
        </Box>
    );
}
