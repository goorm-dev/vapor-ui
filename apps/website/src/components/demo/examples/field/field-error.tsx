'use client';

import { Field, TextInput, VStack } from '@vapor-ui/core';

export default function FieldError() {
    return (
        <VStack gap="$300" className="w-72">
            <Field.Root name="email-error" invalid>
                <Field.Label className="flex flex-col gap-1">
                    Email
                    <TextInput type="email" placeholder="you@example.com" />
                </Field.Label>
                <Field.Error match>Please enter a valid email address.</Field.Error>
            </Field.Root>

            <Field.Root name="email-success">
                <Field.Label className="flex flex-col gap-1">
                    Email
                    <TextInput
                        type="email"
                        placeholder="you@example.com"
                        defaultValue="john@example.com"
                    />
                </Field.Label>
                <Field.Success>Email is valid.</Field.Success>
            </Field.Root>
        </VStack>
    );
}
