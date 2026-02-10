'use client';

import { Field, Text, TextInput, VStack } from '@vapor-ui/core';

export default function FieldDisabled() {
    return (
        <VStack gap="$200" className="w-72">
            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    enabled
                </Text>
                <Field.Root name="email">
                    <Field.Label className="flex flex-col gap-1">
                        Email
                        <TextInput placeholder="you@example.com" />
                    </Field.Label>
                    <Field.Description>Enter your email address.</Field.Description>
                </Field.Root>
            </VStack>

            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    disabled
                </Text>
                <Field.Root name="email-disabled" disabled>
                    <Field.Label className="flex flex-col gap-1">
                        Email
                        <TextInput placeholder="you@example.com" />
                    </Field.Label>
                    <Field.Description>Enter your email address.</Field.Description>
                </Field.Root>
            </VStack>
        </VStack>
    );
}
