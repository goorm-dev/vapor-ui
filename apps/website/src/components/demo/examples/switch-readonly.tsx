import { Switch } from '@vapor-ui/core';

export default function SwitchReadOnly() {
    return (
        <div className="space-y-3">
            <Switch.Root readOnly defaultChecked>
                <Switch.Label>읽기 전용 (켜짐)</Switch.Label>
                <Switch.Control />
            </Switch.Root>
            <Switch.Root readOnly>
                <Switch.Label>읽기 전용 (꺼짐)</Switch.Label>
                <Switch.Control />
            </Switch.Root>
        </div>
    );
}
