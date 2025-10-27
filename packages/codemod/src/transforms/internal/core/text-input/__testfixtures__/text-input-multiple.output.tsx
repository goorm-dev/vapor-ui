import { Field, TextInput } from '@vapor-ui/core';

export function MultipleExample() {
    return (
        <div>
            <Field.Root>
                <Field.Label>
                    First Name
                    <TextInput size="sm" placeholder="First name" />
                </Field.Label>
            </Field.Root>
            <Field.Root>
                <Field.Label>
                    Last Name
                    <TextInput size="md" placeholder="Last name" />
                </Field.Label>
            </Field.Root>
            <TextInput aria-label="Email" size="lg" placeholder="Email" type="email" />
        </div>
    );
}
