import { Switch } from '@goorm-dev/vapor-core';

export function NamedImportExample() {
    return (
        <Switch size="md">
            <Switch.Label>Auto Save</Switch.Label>
            <Switch.Indicator />
        </Switch>
    );
}
