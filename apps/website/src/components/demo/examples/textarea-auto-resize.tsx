import { Box, Textarea } from '@vapor-ui/core';

export default function TextareaAutoResize() {
    return (
        <Box display="flex" alignItems="center" justifyContent="center">
            <Textarea.Root
                autoResize={true}
                placeholder="텍스트를 입력하면 자동으로 높이가 조절됩니다..."
            >
                <Textarea.Field />
            </Textarea.Root>
        </Box>
    );
}
