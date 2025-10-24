import { TextInput } from '@goorm-dev/vapor-core';

export function LabelExample() {
    return (
        <TextInput size="md">
            <TextInput.Label>Name</TextInput.Label>
            <TextInput.Field placeholder="Enter your name" />
        </TextInput>
    );
}
