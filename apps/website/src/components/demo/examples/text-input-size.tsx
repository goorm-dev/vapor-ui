import { TextInput } from '@vapor-ui/core';

export default function TextInputSize() {
    return (
        <div className="space-y-4">
            <TextInput.Root size="sm">
                <TextInput.Label>Small</TextInput.Label>
                <TextInput.Field placeholder="Small size" />
            </TextInput.Root>
            <TextInput.Root size="md">
                <TextInput.Label>Medium</TextInput.Label>
                <TextInput.Field placeholder="Medium size" />
            </TextInput.Root>
            <TextInput.Root size="lg">
                <TextInput.Label>Large</TextInput.Label>
                <TextInput.Field placeholder="Large size" />
            </TextInput.Root>
            <TextInput.Root size="xl">
                <TextInput.Label>Extra Large</TextInput.Label>
                <TextInput.Field placeholder="Extra large size" />
            </TextInput.Root>
        </div>
    );
}