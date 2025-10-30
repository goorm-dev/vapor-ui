import { Switch } from '@goorm-dev/vapor-core';

export function PropsExample() {
    return (
        <div>
            <Switch size="sm" disabled>
                <Switch.Indicator />
            </Switch>
            <Switch size="lg" defaultChecked>
                <Switch.Label>Enable feature</Switch.Label>
                <Switch.Indicator />
            </Switch>
        </div>
    );
}
