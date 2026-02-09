import { TextInput, VStack } from '@vapor-ui/core';

export default function TextInputInvalid() {
    return (
        <VStack $styles={{ gap: '$150' }}>
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
