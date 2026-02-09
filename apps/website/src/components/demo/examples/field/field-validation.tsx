'use client';

import { Field, TextInput, VStack } from '@vapor-ui/core';

export default function FieldValidation() {
    return (
        <VStack className="w-72" $styles={{ gap: '$300' }}>
            <Field.Root name="email" validationMode="onBlur">
                <Field.Label className="flex flex-col gap-1">
                    Email
                    <TextInput type="email" required placeholder="you@example.com" />
                </Field.Label>
                <Field.Description>Validated when you leave the field.</Field.Description>
                <Field.Error match="valueMissing">Email is required.</Field.Error>
                <Field.Error match="typeMismatch">Please enter a valid email.</Field.Error>
                <Field.Success>Email looks good.</Field.Success>
            </Field.Root>

            <Field.Root name="password" validationMode="onChange">
                <Field.Label className="flex flex-col gap-1">
                    Password
                    <TextInput
                        type="password"
                        required
                        minLength={8}
                        placeholder="Enter password"
                    />
                </Field.Label>
                <Field.Description>Validated as you type. Minimum 8 characters.</Field.Description>
                <Field.Error match="valueMissing">Password is required.</Field.Error>
                <Field.Error match="tooShort">Password must be at least 8 characters.</Field.Error>
                <Field.Success>Password is strong.</Field.Success>
            </Field.Root>
        </VStack>
    );
}
