import React from 'react';
import { TextInput, Field } from '@vapor-ui/core';

export function ControlledExample() {
    const [value, setValue] = React.useState<string | undefined>();

    return (
        <Field.Root>
            <Field.Label>
                Email
                <TextInput
                    value={value}
                    onValueChange={setValue}
                    placeholder="Enter email"
                    type="email"
                />
            </Field.Label>
        </Field.Root>
    );
}
