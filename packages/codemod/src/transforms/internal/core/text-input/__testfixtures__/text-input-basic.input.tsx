import { TextInput } from '@goorm-dev/vapor-core';

export function BasicExample() {
    return (
        <TextInput size="md" invalid={false}>
            <TextInput.Field placeholder="Enter text" />
        </TextInput>
    );
}
