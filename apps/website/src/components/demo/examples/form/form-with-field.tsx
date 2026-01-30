'use client';

import { Button, Checkbox, Field, Form, HStack, Select, TextInput, VStack } from '@vapor-ui/core';

export default function FormWithField() {
    return (
        <Form
            onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                console.log('Form submitted:', Object.fromEntries(formData));
            }}
        >
            <VStack gap="$300" className="w-80">
                <Field.Root name="fullName">
                    <VStack render={<Field.Label />} gap="$050">
                        Full Name
                        <TextInput placeholder="John Doe" required />
                    </VStack>
                    <Field.Error match="valueMissing">Name is required</Field.Error>
                </Field.Root>

                <Field.Root name="email">
                    <VStack render={<Field.Label />} gap="$050">
                        Email
                        <TextInput type="email" placeholder="john@example.com" required />
                    </VStack>
                    <Field.Description>We'll send a confirmation to this email.</Field.Description>
                    <Field.Error match="valueMissing">Email is required</Field.Error>
                    <Field.Error match="typeMismatch">Enter a valid email</Field.Error>
                </Field.Root>

                <Field.Root name="role">
                    <Select.Root placeholder="Select a role">
                        <VStack render={<Field.Label />} gap="$050">
                            Role
                            <Select.Trigger />
                        </VStack>
                        <Select.Popup>
                            <Select.Item value="developer">Developer</Select.Item>
                            <Select.Item value="designer">Designer</Select.Item>
                            <Select.Item value="manager">Manager</Select.Item>
                        </Select.Popup>
                    </Select.Root>
                </Field.Root>

                <Field.Root name="terms">
                    <HStack render={<Field.Label />} gap="$100" alignItems="center">
                        <Checkbox.Root required />I agree to the terms and conditions
                    </HStack>
                    <Field.Error match="valueMissing">You must accept the terms</Field.Error>
                </Field.Root>

                <Button type="submit" colorPalette="primary">
                    Create Account
                </Button>
            </VStack>
        </Form>
    );
}
