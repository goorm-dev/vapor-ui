import { TextInput } from '@vapor-ui/core';

export default function TextInputStates() {
    return (
        <div className="space-y-4">
            <TextInput.Root>
                <TextInput.Label>Default</TextInput.Label>
                <TextInput.Field placeholder="Default state" />
            </TextInput.Root>
            <TextInput.Root disabled>
                <TextInput.Label>Disabled</TextInput.Label>
                <TextInput.Field placeholder="Disabled state" />
            </TextInput.Root>
            <TextInput.Root invalid>
                <TextInput.Label>Invalid</TextInput.Label>
                <TextInput.Field placeholder="Invalid state" />
            </TextInput.Root>
            <TextInput.Root readOnly>
                <TextInput.Label>Read Only</TextInput.Label>
                <TextInput.Field value="Read only value" />
            </TextInput.Root>
        </div>
    );
}