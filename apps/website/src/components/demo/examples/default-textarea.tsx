import { Box, Textarea } from '@vapor-ui/core';

export default function DefaultTextarea() {
    return (
        <Box display="flex" alignItems="center" justifyContent="center">
            <Textarea.Root placeholder="여러 줄 텍스트를 입력하세요...">
                <Textarea.Input />
            </Textarea.Root>
        </Box>
    );
}
