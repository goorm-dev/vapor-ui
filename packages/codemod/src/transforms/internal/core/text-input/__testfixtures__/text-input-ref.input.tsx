import React from 'react';
import { TextInput } from '@goorm-dev/vapor-core';

export function RefExample() {
    const inputRef = React.useRef<HTMLInputElement>(null);

    return (
        <TextInput size="md">
            <TextInput.Label>Name</TextInput.Label>
            <TextInput.Field ref={inputRef} placeholder="Enter name" />
        </TextInput>
    );
}
