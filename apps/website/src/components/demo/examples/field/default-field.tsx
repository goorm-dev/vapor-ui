'use client';

import { Field, TextInput, VStack } from '@vapor-ui/core';

export default function DefaultField() {
    return (
        <Field.Root name="email" className="w-72">
            <VStack render={<Field.Label />} gap="$050">
                Email
                <TextInput type="email" placeholder="you@example.com" />
            </VStack>
            <Field.Description>We'll never share your email.</Field.Description>
        </Field.Root>
    );
}
