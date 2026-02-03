'use client';

import { Button, Field, Form, TextInput, VStack } from '@vapor-ui/core';

export default function DefaultForm() {
    return (
        <Form
            onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                console.log('Form submitted:', Object.fromEntries(formData));
            }}
        >
            <VStack gap="$200" className="w-72">
                <Field.Root name="username">
                    <VStack render={<Field.Label />} gap="$050">
                        Username
                        <TextInput placeholder="Enter username" />
                    </VStack>
                </Field.Root>

                <Field.Root name="email">
                    <VStack render={<Field.Label />} gap="$050">
                        Email
                        <TextInput type="email" placeholder="you@example.com" />
                    </VStack>
                </Field.Root>

                <Button type="submit" colorPalette="primary">
                    Submit
                </Button>
            </VStack>
        </Form>
    );
}
