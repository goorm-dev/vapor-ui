import { Switch } from '@goorm-dev/vapor-core';
import { Button } from '@vapor-ui/core';

export function MergeImportsExample() {
    return (
        <div>
            <Switch size="md">
                <Switch.Indicator />
            </Switch>
            <Button>Submit</Button>
        </div>
    );
}
