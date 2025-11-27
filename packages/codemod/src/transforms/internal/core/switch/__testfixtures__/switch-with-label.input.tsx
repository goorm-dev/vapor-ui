// @ts-nocheck
import { Switch } from '@goorm-dev/vapor-core';

export function LabelExample() {
    return (
        <Switch size="md">
            <Switch.Label>Dark Mode</Switch.Label>
            <Switch.Indicator />
        </Switch>
    );
}
