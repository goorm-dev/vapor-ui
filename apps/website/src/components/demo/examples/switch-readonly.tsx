import { Switch } from '@vapor-ui/core';

export default function SwitchReadOnly() {
    return (
        <div className="space-y-3">
            <Switch.Root readOnly defaultChecked>
                <Switch.Thumb />
            </Switch.Root>
            <Switch.Root readOnly>
                <Switch.Thumb />
            </Switch.Root>
        </div>
    );
}
