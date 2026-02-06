import { Switch } from '@vapor-ui/core';

export default function AnatomySwitch() {
    return (
        <Switch.Root data-part="Root" defaultChecked>
            <Switch.ThumbPrimitive data-part="ThumbPrimitive" />
        </Switch.Root>
    );
}
