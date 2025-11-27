import React from 'react';

import { Field, Switch } from '@vapor-ui/core';

export function ControlledExample() {
    const [enabled, setEnabled] = React.useState(false);

    return (
        <Field.Root>
            <Field.Label>
                Notifications
                <Switch.Root size="md" checked={enabled} onCheckedChange={setEnabled}>
                    <Switch.ThumbPrimitive />
                </Switch.Root>
            </Field.Label>
        </Field.Root>
    );
}
