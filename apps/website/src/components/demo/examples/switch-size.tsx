import { Switch } from '@vapor-ui/core';

export default function SwitchSize() {
    return (
        <div className="flex gap-8">
            <Switch.Root size="sm" />
            <Switch.Root size="md" />
            <Switch.Root size="lg" />
        </div>
    );
}
