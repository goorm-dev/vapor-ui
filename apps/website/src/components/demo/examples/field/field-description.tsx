'use client';

import { Field, TextInput, VStack } from '@vapor-ui/core';

export default function FieldDescription() {
    return (
        <VStack gap="$300" className="w-72">
            <Field.Root name="username">
                <Field.Label className="flex flex-col gap-1">
                    Username
                    <TextInput placeholder="johndoe" />
                </Field.Label>
            </Field.Root>

            <Field.Root name="username-with-desc">
                <Field.Label className="flex flex-col gap-1">
                    Username
                    <TextInput placeholder="johndoe" />
                </Field.Label>
                <Field.Description>This will be your public display name.</Field.Description>
            </Field.Root>
        </VStack>
    );
}
