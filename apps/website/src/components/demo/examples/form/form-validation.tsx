'use client';

import { Button, Field, Form, TextInput, VStack } from '@vapor-ui/core';

export default function FormValidation() {
    return (
        <Form
            onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                console.log('Form submitted:', Object.fromEntries(formData));
            }}
        >
            <VStack gap="$200" className="w-72">
                <Field.Root name="email">
                    <VStack render={<Field.Label />} gap="$050">
                        Email
                        <TextInput type="email" placeholder="you@example.com" required />
                    </VStack>
                    <Field.Error match="valueMissing">Email is required</Field.Error>
                    <Field.Error match="typeMismatch">Enter a valid email address</Field.Error>
                </Field.Root>

                <Field.Root name="password">
                    <VStack render={<Field.Label />} gap="$050">
                        Password
                        <TextInput
                            type="password"
                            placeholder="Enter password"
                            required
                            minLength={8}
                        />
                    </VStack>
                    <Field.Error match="valueMissing">Password is required</Field.Error>
                    <Field.Error match="tooShort">
                        Password must be at least 8 characters
                    </Field.Error>
                </Field.Root>

                <Button type="submit" colorPalette="primary">
                    Sign Up
                </Button>
            </VStack>
        </Form>
    );
}
