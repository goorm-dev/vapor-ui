import { Switch } from '@vapor-ui/core';

export default function SwitchDisabled() {
    return (
        <div className="space-y-3">
            <label>
                비활성화 - Off
                <Switch.Root disabled />
            </label>

            <label>
                비활성화 - On
                <Switch.Root disabled defaultChecked />
            </label>
        </div>
    );
}
