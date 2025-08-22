import { Switch } from '@vapor-ui/core';

export default function SwitchChecked() {
    return (
        <div className="space-y-3">
            <Switch.Root>
                <Switch.Label>체크되지 않음</Switch.Label>
                <Switch.Control />
            </Switch.Root>
            <Switch.Root defaultChecked>
                <Switch.Label>체크됨</Switch.Label>
                <Switch.Control />
            </Switch.Root>
        </div>
    );
}
