import { Switch } from '@vapor-ui/core';

export default function SwitchChecked() {
    return (
        <div className="space-y-3">
            <label>
                체크되지 않음
                <Switch.Root />
            </label>

            <label>
                체크됨
                <Switch.Root defaultChecked />
            </label>
        </div>
    );
}
