import { Switch } from '@vapor-ui/core';

export default function SwitchStates() {
    return (
        <div className="flex gap-8">
            <Switch.Root />
            <Switch.Root defaultChecked />
            <Switch.Root disabled />
            <Switch.Root disabled defaultChecked />
        </div>
    );
}
