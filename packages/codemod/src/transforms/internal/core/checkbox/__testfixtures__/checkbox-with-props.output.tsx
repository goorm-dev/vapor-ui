import { useState } from 'react';

import { Checkbox } from '@vapor-ui/core';

export const Component = () => {
    const [checked, setChecked] = useState(false);

    return (
        // TODO: onCheckedChange signature changed - now receives (checked: boolean, event: Event) instead of (checked: CheckedState)
        // TODO: If checked can be 'indeterminate', split the logic: use indeterminate prop for indeterminate state and checked prop for boolean
        <Checkbox.Root checked={checked} onCheckedChange={(checked) => console.log(checked)}>
            <Checkbox.Indicator />
        </Checkbox.Root>
    );
};
