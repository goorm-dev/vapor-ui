import { Box, TextInput } from '@vapor-ui/core';

export default function TextInputCharacterCount() {
    return (
        <Box display="flex" alignItems="center" justifyContent="center">
            <TextInput.Root placeholder="Type to see character count..." maxLength={50}>
                <TextInput.Label>Character Count</TextInput.Label>
                <TextInput.Field />
                <TextInput.Count />
            </TextInput.Root>
        </Box>
    );
}
