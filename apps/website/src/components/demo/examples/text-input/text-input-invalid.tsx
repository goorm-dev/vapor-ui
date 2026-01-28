import { TextInput, VStack } from '@vapor-ui/core';

export default function TextInputInvalid() {
    return (
        <VStack gap="$150">
            <TextInput
                type="email"
                invalid
                placeholder="Invalid email"
                defaultValue="invalid-email"
            />
            <TextInput invalid placeholder="Required field" />
        </VStack>
    );
}
