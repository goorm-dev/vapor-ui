import { Switch } from '@vapor-ui/core';

export default function SwitchDisabled() {
    return (
        <div className="space-y-3">
            <Switch.Root disabled>
                <Switch.Label>비활성화 - Off</Switch.Label>
                <Switch.Control />
            </Switch.Root>
            <Switch.Root disabled defaultChecked>
                <Switch.Label>비활성화 - On</Switch.Label>
                <Switch.Control />
            </Switch.Root>
        </div>
    );
}
