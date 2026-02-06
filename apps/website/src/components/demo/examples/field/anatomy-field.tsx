'use client';

import { Field, TextInput } from '@vapor-ui/core';

export default function AnatomyField() {
    return (
        <Field.Root data-part="Root" name="email" className="w-72">
            <Field.Label data-part="Label" gap="$050" flexDirection="column">
                Email
            </Field.Label>
            <Field.Item
                data-part="Item"
                render={<TextInput type="email" placeholder="you@example.com" />}
            />
            <Field.Description data-part="Description">
                We'll never share your email.
            </Field.Description>
            <Field.Error data-part="Error" match>
                Please enter a valid email address.
            </Field.Error>
            <Field.Success data-part="Success" match>
                Email is available.
            </Field.Success>
        </Field.Root>
    );
}
