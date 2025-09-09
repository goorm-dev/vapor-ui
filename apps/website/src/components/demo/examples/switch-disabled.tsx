import { Switch } from '@vapor-ui/core';

export default function SwitchDisabled() {
    return (
        <div className="space-y-3">
            <Switch.Root disabled />
            <Switch.Root disabled defaultChecked />
        </div>
    );
}
