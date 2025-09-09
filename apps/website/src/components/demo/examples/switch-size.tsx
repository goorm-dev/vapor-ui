import { Switch } from '@vapor-ui/core';

export default function SwitchSize() {
    return (
        <div className="flex gap-8">
            <div className="flex flex-col items-center gap-2">
                <label>
                    Small
                    <Switch.Root size="sm" />
                </label>
            </div>
            <div className="flex flex-col items-center gap-2">
                <label>
                    Medium
                    <Switch.Root size="md" />
                </label>
            </div>
            <div className="flex flex-col items-center gap-2">
                <label>
                    Large
                    <Switch.Root size="lg" />
                </label>
            </div>
        </div>
    );
}
