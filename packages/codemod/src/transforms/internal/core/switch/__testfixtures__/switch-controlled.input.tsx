// @ts-nocheck
import React from 'react';

import { Switch } from '@goorm-dev/vapor-core';

export function ControlledExample() {
    const [enabled, setEnabled] = React.useState(false);

    return (
        <Switch size="md" checked={enabled} onCheckedChange={setEnabled}>
            <Switch.Label>Notifications</Switch.Label>
            <Switch.Indicator />
        </Switch>
    );
}
