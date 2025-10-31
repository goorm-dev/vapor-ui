import { Field, Switch } from '@vapor-ui/core';

export function NamedImportExample() {
    return (
        <Field.Root>
            <Field.Label>
                Auto Save
                <Switch.Root size="md">
                    <Switch.Thumb />
                </Switch.Root>
            </Field.Label>
        </Field.Root>
    );
}
