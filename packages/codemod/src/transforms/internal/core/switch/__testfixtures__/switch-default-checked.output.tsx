import { Field, Switch } from '@vapor-ui/core';

export function DefaultCheckedExample() {
    return (
        <div>
            <Field.Root>
                <Field.Label>
                    Remember me
                    <Switch.Root defaultChecked size="sm">
                        <Switch.ThumbPrimitive />
                    </Switch.Root>
                </Field.Label>
            </Field.Root>
            <Switch.Root defaultChecked={false} size="md">
                <Switch.ThumbPrimitive />
            </Switch.Root>
        </div>
    );
}
