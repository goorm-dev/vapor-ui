import { Box, Textarea } from '@vapor-ui/core';

export default function TextareaCharacterCount() {
    return (
        <Box $css={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Textarea placeholder="Type your message..." maxLength={100} />
        </Box>
    );
}
