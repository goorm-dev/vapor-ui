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
            <VStack className="w-72" $styles={{ gap: '$200' }}>
                <Field.Root name="username">
                    <VStack render={<Field.Label />} $styles={{ gap: '$050' }}>
                        Username
                        <TextInput placeholder="Enter username" />
                    </VStack>
                </Field.Root>

                <Field.Root name="email">
                    <VStack render={<Field.Label />} $styles={{ gap: '$050' }}>
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
