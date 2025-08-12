import { Switch } from '@vapor-ui/core';

export default function SwitchStates() {
    return (
        <div className="flex gap-8">
            <div className="flex flex-col items-center gap-2">
                <Switch.Root>
                    <Switch.Label>Default</Switch.Label>
                    <Switch.Control />
                </Switch.Root>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Switch.Root defaultChecked>
                    <Switch.Label>Checked</Switch.Label>
                    <Switch.Control />
                </Switch.Root>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Switch.Root disabled>
                    <Switch.Label>Disabled</Switch.Label>
                    <Switch.Control />
                </Switch.Root>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Switch.Root disabled defaultChecked>
                    <Switch.Label>Disabled Checked</Switch.Label>
                    <Switch.Control />
                </Switch.Root>
            </div>
        </div>
    );
}