import { Field, Switch } from '@vapor-ui/core';

export function PropsExample() {
    return (
        <div>
            <Switch.Root size="sm" disabled>
                <Switch.ThumbPrimitive />
            </Switch.Root>
            <Field.Root>
                <Field.Label>
                    Enable feature
                    <Switch.Root size="lg" defaultChecked>
                        <Switch.ThumbPrimitive />
                    </Switch.Root>
                </Field.Label>
            </Field.Root>
        </div>
    );
}
