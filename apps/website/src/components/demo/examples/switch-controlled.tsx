import { useState } from 'react';

import { Switch } from '@vapor-ui/core';

export default function SwitchControlled() {
    const [checked, setChecked] = useState(false);

    return (
        <div className="space-y-4">
            <Switch.Root checked={checked} onCheckedChange={setChecked} />
            <p>Current state: {checked ? 'On' : 'Off'}</p>
        </div>
    );
}
