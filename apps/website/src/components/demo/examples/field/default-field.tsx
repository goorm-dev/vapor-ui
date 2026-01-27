'use client';

import { Field, TextInput } from '@vapor-ui/core';

export default function DefaultField() {
    return (
        <Field.Root name="email" className="w-72">
            <Field.Label className="flex flex-col gap-1">
                Email
                <TextInput type="email" placeholder="you@example.com" />
            </Field.Label>
            <Field.Description>We'll never share your email.</Field.Description>
        </Field.Root>
    );
}
