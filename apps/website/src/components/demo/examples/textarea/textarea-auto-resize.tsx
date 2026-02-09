import { Box, Textarea } from '@vapor-ui/core';

export default function TextareaAutoResize() {
    return (
        <Box $styles={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <Textarea autoResize placeholder="텍스트를 입력하면 자동으로 높이가 조절됩니다..." />
        </Box>
    );
}
