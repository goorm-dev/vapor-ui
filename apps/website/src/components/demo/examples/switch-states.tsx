import { Switch } from '@vapor-ui/core';

export default function SwitchStates() {
    return (
        <div className="flex gap-8">
            <div className="flex flex-col items-center gap-2">
                <label>
                    Default
                    <Switch.Root />
                </label>
            </div>
            <div className="flex flex-col items-center gap-2">
                <label>
                    Checked
                    <Switch.Root defaultChecked />
                </label>
            </div>
            <div className="flex flex-col items-center gap-2">
                <label>
                    Disabled
                    <Switch.Root disabled />
                </label>
            </div>
            <div className="flex flex-col items-center gap-2">
                <label>
                    Disabled Checked
                    <Switch.Root disabled defaultChecked />
                </label>
            </div>
        </div>
    );
}
