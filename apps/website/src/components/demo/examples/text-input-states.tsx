import { TextInput } from '@vapor-ui/core';

export default function TextInputStates() {
    return (
        <div className="space-y-4">
            <TextInput.Root placeholder="Default state">
                <TextInput.Label>Default</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
            <TextInput.Root disabled placeholder="Disabled state">
                <TextInput.Label>Disabled</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
            <TextInput.Root invalid placeholder="Invalid state">
                <TextInput.Label>Invalid</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
            <TextInput.Root readOnly value="Read only value">
                <TextInput.Label>Read Only</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
        </div>
    );
}
