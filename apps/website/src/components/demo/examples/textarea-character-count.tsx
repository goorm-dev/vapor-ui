import { Box, Textarea } from '@vapor-ui/core';

export default function TextareaCharacterCount() {
    return (
        <Box display="flex" alignItems="center" justifyContent="center">
            <Textarea.Root placeholder="Type to see character count..." maxLength={100}>
                <Textarea.Input />
                <Textarea.Count />
            </Textarea.Root>
        </Box>
    );
}
