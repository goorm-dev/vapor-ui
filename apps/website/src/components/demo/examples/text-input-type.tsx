import { TextInput } from '@vapor-ui/core';

export default function TextInputType() {
    return (
        <div className="space-y-4">
            <TextInput.Root type="text">
                <TextInput.Label>Text</TextInput.Label>
                <TextInput.Field placeholder="Enter text" />
            </TextInput.Root>
            <TextInput.Root type="email">
                <TextInput.Label>Email</TextInput.Label>
                <TextInput.Field placeholder="Enter email" />
            </TextInput.Root>
            <TextInput.Root type="password">
                <TextInput.Label>Password</TextInput.Label>
                <TextInput.Field placeholder="Enter password" />
            </TextInput.Root>
        </div>
    );
}