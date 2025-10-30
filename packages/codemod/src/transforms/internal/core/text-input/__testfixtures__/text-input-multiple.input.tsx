import { TextInput } from '@goorm-dev/vapor-core';

export function MultipleExample() {
    return (
        <div>
            <TextInput size="sm">
                <TextInput.Label>First Name</TextInput.Label>
                <TextInput.Field placeholder="First name" />
            </TextInput>

            <TextInput size="md">
                <TextInput.Label>Last Name</TextInput.Label>
                <TextInput.Field placeholder="Last name" />
            </TextInput>

            <TextInput size="lg">
                <TextInput.Label visuallyHidden>Email</TextInput.Label>
                <TextInput.Field placeholder="Email" type="email" />
            </TextInput>
        </div>
    );
}
