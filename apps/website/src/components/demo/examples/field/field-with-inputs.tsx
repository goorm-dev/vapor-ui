'use client';

import { Checkbox, Field, Select, Switch, TextInput, VStack } from '@vapor-ui/core';

export default function FieldWithInputs() {
    return (
        <VStack gap="$300" className="w-72">
            <Field.Root name="email">
                <Field.Label flexDirection="column" gap="$050">
                    Email
                    <TextInput type="email" placeholder="you@example.com" />
                </Field.Label>
                <Field.Description>Your primary contact email.</Field.Description>
            </Field.Root>

            <Field.Root name="newsletter">
                <Field.Label flexDirection="row" gap="$100" alignItems="center">
                    <Checkbox.Root />
                    Subscribe to newsletter
                </Field.Label>
                <Field.Description>Get the latest updates in your inbox.</Field.Description>
            </Field.Root>

            <Field.Root name="notifications">
                <Field.Label flexDirection="row" gap="$100" alignItems="center">
                    <Switch.Root />
                    Push notifications
                </Field.Label>
                <Field.Description>Receive alerts on your device.</Field.Description>
            </Field.Root>

            <Field.Root name="country">
                <Select.Root>
                    <Field.Label flexDirection="column" gap="$050">
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
