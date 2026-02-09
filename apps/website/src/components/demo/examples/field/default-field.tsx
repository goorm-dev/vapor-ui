'use client';

import { Field, TextInput } from '@vapor-ui/core';

export default function DefaultField() {
    return (
        <Field.Root name="email" className="w-72">
            <Field.Label $styles={{ gap: '$050', flexDirection: 'column' }}>
                Email
                <TextInput type="email" placeholder="you@example.com" />
            </Field.Label>
            <Field.Description>We'll never share your email.</Field.Description>
        </Field.Root>
    );
}
