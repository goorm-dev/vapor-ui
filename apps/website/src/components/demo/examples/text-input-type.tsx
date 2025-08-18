import { TextInput } from '@vapor-ui/core';

export default function TextInputType() {
    return (
        <div className="space-y-4">
            <TextInput.Root type="text" placeholder="Enter text">
                <TextInput.Label>Text</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
            <TextInput.Root type="email" placeholder="Enter email">
                <TextInput.Label>Email</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
            <TextInput.Root type="password" placeholder="Enter password">
                <TextInput.Label>Password</TextInput.Label>
                <TextInput.Field />
            </TextInput.Root>
        </div>
    );
}