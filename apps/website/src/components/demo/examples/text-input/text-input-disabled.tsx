import { TextInput, VStack } from '@vapor-ui/core';

export default function TextInputDisabled() {
    return (
        <VStack gap="$150">
            <TextInput disabled placeholder="Disabled input" />
            <TextInput disabled defaultValue="Disabled with value" />
        </VStack>
    );
}
