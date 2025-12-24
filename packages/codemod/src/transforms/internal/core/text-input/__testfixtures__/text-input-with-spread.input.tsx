import { TextInput } from '@goorm-dev/vapor-core';

export function SpreadExample() {
    const inputProps = {
        placeholder: 'Enter text',
        maxLength: 50,
        type: 'text' as const,
    };

    return (
        <TextInput size="md" invalid={false}>
            <TextInput.Field {...inputProps} />
        </TextInput>
    );
}
