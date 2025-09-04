import { Box, Textarea } from '@vapor-ui/core';

export default function TextareaResizing() {
    return (
        <Box>
            <Textarea.Root
                resizing={true}
                placeholder="크기 조절 가능 (우하단 모서리를 드래그하세요)"
            >
                <Textarea.Field />
            </Textarea.Root>
        </Box>
    );
}
