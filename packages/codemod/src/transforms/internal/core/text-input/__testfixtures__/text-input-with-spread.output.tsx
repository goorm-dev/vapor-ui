import { TextInput } from '@vapor-ui/core';

export function SpreadExample() {
    const inputProps = {
        placeholder: 'Enter text',
        maxLength: 50,
        type: 'text' as const,
    };

    return <TextInput size="md" invalid={false} {...inputProps} />;
}
