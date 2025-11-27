// @ts-nocheck
import { Switch } from '@goorm-dev/vapor-core';

export function MultipleExample() {
    return (
        <div>
            <Switch size="sm">
                <Switch.Label>Option 1</Switch.Label>
                <Switch.Indicator />
            </Switch>
            <Switch size="md">
                <Switch.Label>Option 2</Switch.Label>
                <Switch.Indicator />
            </Switch>
            <Switch size="lg">
                <Switch.Indicator />
            </Switch>
        </div>
    );
}
