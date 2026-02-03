import { Button } from '@goorm-dev/vapor-core';
import { Switch } from '@vapor-ui/core';

export function WithOtherComponentsExample() {
    return (
        <div>
            <Switch.Root size="md">
                <Switch.ThumbPrimitive />
            </Switch.Root>
            <Button>Save</Button>
        </div>
    );
}
