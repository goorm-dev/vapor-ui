import { TextInput } from '@vapor-ui/core';

export default function TextInputSize() {
    return (
        <div className="space-y-4">
            <TextInput.Root size="sm" placeholder="Small size">
                <TextInput.Label>Small</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
            <TextInput.Root size="md" placeholder="Medium size">
                <TextInput.Label>Medium</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
            <TextInput.Root size="lg" placeholder="Large size">
                <TextInput.Label>Large</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
            <TextInput.Root size="xl" placeholder="Extra large size">
                <TextInput.Label>Extra Large</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
        </div>
    );
}
