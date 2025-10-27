import { Field, TextInput } from '@vapor-ui/core';

export function LabelExample() {
    return (
        <Field.Root>
            <Field.Label>
                Name
                <TextInput size="md" placeholder="Enter your name" />
            </Field.Label>
        </Field.Root>
    );
}
