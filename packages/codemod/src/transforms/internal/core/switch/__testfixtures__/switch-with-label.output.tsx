import { Field, Switch } from '@vapor-ui/core';

export function LabelExample() {
    return (
        <Field.Root>
            <Field.Label>
                Dark Mode
                <Switch.Root size="md">
                    <Switch.ThumbPrimitive />
                </Switch.Root>
            </Field.Label>
        </Field.Root>
    );
}
