import { Field, Switch } from '@vapor-ui/core';

export function PropsExample() {
    return (
        <div>
            <Switch.Root size="sm" disabled>
                <Switch.Thumb />
            </Switch.Root>
            <Field.Root>
                <Field.Label>
                    Enable feature
                    <Switch.Root size="lg" defaultChecked>
                        <Switch.Thumb />
                    </Switch.Root>
                </Field.Label>
            </Field.Root>
        </div>
    );
}
