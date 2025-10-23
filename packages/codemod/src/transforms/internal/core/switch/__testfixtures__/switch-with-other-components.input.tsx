import { Switch, Button } from '@goorm-dev/vapor-core';

export function WithOtherComponentsExample() {
    return (
        <div>
            <Switch size="md">
                <Switch.Indicator />
            </Switch>
            <Button>Save</Button>
        </div>
    );
}
