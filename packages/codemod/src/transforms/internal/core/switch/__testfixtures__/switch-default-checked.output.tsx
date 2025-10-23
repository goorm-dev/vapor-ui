import { Switch, Field } from '@vapor-ui/core';

export function DefaultCheckedExample() {
    return (
        <div>
            <Field.Root>
                <Field.Label>
                    Remember me
                    <Switch.Root defaultChecked size="sm">
                        <Switch.Thumb />
                    </Switch.Root>
                </Field.Label>
            </Field.Root>
            <Switch.Root defaultChecked={false} size="md">
                <Switch.Thumb />
            </Switch.Root>
        </div>
    );
}
