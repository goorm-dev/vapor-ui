import { TextInput, VStack } from '@vapor-ui/core';

export default function TextInputReadOnly() {
    return (
        <VStack gap="$150">
            <TextInput readOnly defaultValue="Read only value" />
            <TextInput type="email" readOnly defaultValue="user@example.com" />
        </VStack>
    );
}
