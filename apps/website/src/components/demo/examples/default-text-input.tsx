import { TextInput } from '@vapor-ui/core';

export default function DefaultTextInput() {
    return (
        <TextInput.Root>
            <TextInput.Label>Label</TextInput.Label>
            <TextInput.Field />
        </TextInput.Root>
    );
}
