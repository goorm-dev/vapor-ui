import React from 'react';
import { Switch, Field } from '@vapor-ui/core';

export function ControlledExample() {
    const [enabled, setEnabled] = React.useState(false);

    return (
        <Field.Root>
            <Field.Label>
                Notifications
                <Switch.Root size="md" checked={enabled} onCheckedChange={setEnabled}>
                    <Switch.Thumb />
                </Switch.Root>
            </Field.Label>
        </Field.Root>
    );
}
