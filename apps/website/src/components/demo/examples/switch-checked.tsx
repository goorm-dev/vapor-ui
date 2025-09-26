import { Switch } from '@vapor-ui/core';

export default function SwitchChecked() {
    return (
        <div className="space-y-3">
            <Switch.Root />
            <Switch.Root defaultChecked />
        </div>
    );
}
