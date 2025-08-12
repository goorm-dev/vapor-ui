import { Switch } from '@vapor-ui/core';

export default function SwitchSize() {
    return (
        <div className="flex gap-8">
            <div className="flex flex-col items-center gap-2">
                <Switch.Root size="sm">
                    <Switch.Label>Small</Switch.Label>
                    <Switch.Control />
                </Switch.Root>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Switch.Root size="md">
                    <Switch.Label>Medium</Switch.Label>
                    <Switch.Control />
                </Switch.Root>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Switch.Root size="lg">
                    <Switch.Label>Large</Switch.Label>
                    <Switch.Control />
                </Switch.Root>
            </div>
        </div>
    );
}