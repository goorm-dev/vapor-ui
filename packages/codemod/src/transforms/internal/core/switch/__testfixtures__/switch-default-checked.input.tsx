import { Switch } from '@goorm-dev/vapor-core';

export function DefaultCheckedExample() {
    return (
        <div>
            <Switch defaultChecked size="sm">
                <Switch.Label>Remember me</Switch.Label>
                <Switch.Indicator />
            </Switch>
            <Switch defaultChecked={false} size="md">
                <Switch.Indicator />
            </Switch>
        </div>
    );
}
