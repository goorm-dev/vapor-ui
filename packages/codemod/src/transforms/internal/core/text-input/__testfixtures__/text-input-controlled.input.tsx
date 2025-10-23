// @ts-nocheck
import React from 'react';
import { TextInput } from '@goorm-dev/vapor-core';

export function ControlledExample() {
    const [value, setValue] = React.useState<string | undefined>();

    return (
        <TextInput value={value} onValueChange={setValue}>
            <TextInput.Label>Email</TextInput.Label>
            <TextInput.Field placeholder="Enter email" type="email" />
        </TextInput>
    );
}
