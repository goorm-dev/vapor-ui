import React from 'react';
import { TextInput, Field } from '@vapor-ui/core';

export function RefExample() {
    const inputRef = React.useRef<HTMLInputElement>(null);

    return (
        <Field.Root>
            <Field.Label>
                Name
                <TextInput size="md" ref={inputRef} placeholder="Enter name" />
            </Field.Label>
        </Field.Root>
    );
}
