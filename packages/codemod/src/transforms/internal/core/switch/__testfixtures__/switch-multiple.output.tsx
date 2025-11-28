import { Field, Switch } from '@vapor-ui/core';

export function MultipleExample() {
    return (
        <div>
            <Field.Root>
                <Field.Label>
                    Option 1
                    <Switch.Root size="sm">
                        <Switch.ThumbPrimitive />
                    </Switch.Root>
                </Field.Label>
            </Field.Root>
            <Field.Root>
                <Field.Label>
                    Option 2
                    <Switch.Root size="md">
                        <Switch.ThumbPrimitive />
                    </Switch.Root>
                </Field.Label>
            </Field.Root>
            <Switch.Root size="lg">
                <Switch.ThumbPrimitive />
            </Switch.Root>
        </div>
    );
}
