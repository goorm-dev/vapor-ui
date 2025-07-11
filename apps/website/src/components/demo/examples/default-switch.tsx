import { Switch } from '@vapor-ui/core';

export default function DefaultSwitch() {
    return (
        <Switch.Root>
            <Switch.Label>Airplane mode</Switch.Label>
            <Switch.Control />
        </Switch.Root>
    );
}
