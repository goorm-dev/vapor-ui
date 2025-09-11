import { Box, Textarea } from '@vapor-ui/core';

export default function TextareaCharacterCount() {
    return (
        <Box display="flex" alignItems="center" justifyContent="center">
            <Textarea.Root placeholder="Type to see character count..." maxLength={100}>
                <Textarea.Input />
                <Box display="flex" justifyContent="flex-end">
                    <Textarea.Count />
                </Box>
            </Textarea.Root>
        </Box>
    );
}
