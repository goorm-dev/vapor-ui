import { TextInput } from '@goorm-dev/vapor-core';

export function HiddenLabelExample() {
    return (
        <TextInput size="md">
            <TextInput.Label visuallyHidden>Search</TextInput.Label>
            <TextInput.Field placeholder="Search..." />
        </TextInput>
    );
}
