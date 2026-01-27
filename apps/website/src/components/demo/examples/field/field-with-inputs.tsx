'use client';

import { Checkbox, Field, HStack, Select, Switch, TextInput, VStack } from '@vapor-ui/core';

export default function FieldWithInputs() {
    return (
        <VStack gap="$300" className="w-72">
            <Field.Root name="email">
                <Field.Label className="flex flex-col gap-1">
                    Email
                    <TextInput type="email" placeholder="you@example.com" />
                </Field.Label>
                <Field.Description>Your primary contact email.</Field.Description>
            </Field.Root>

            <Field.Root name="newsletter">
                <HStack render={<Field.Label />} gap="$100" alignItems="center">
                    <Checkbox.Root />
                    Subscribe to newsletter
                </HStack>
                <Field.Description>Get the latest updates in your inbox.</Field.Description>
            </Field.Root>

            <Field.Root name="notifications">
                <HStack render={<Field.Label />} gap="$100" alignItems="center">
                    <Switch.Root />
                    Push notifications
                </HStack>
                <Field.Description>Receive alerts on your device.</Field.Description>
            </Field.Root>

            <Field.Root name="country">
                <Select.Root>
                    <Field.Label className="flex flex-col gap-1">
                        Country
                        <Select.Trigger />
                    </Field.Label>
                    <Select.Popup>
                        <Select.Item value="us">United States</Select.Item>
                        <Select.Item value="uk">United Kingdom</Select.Item>
                        <Select.Item value="kr">South Korea</Select.Item>
                        <Select.Item value="jp">Japan</Select.Item>
                    </Select.Popup>
                </Select.Root>
                <Field.Description>Select your country of residence.</Field.Description>
            </Field.Root>
        </VStack>
    );
}
