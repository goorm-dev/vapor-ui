//@ts-nocheck
import { useState } from 'react';

import { Checkbox } from '@goorm-dev/vapor-core';

export const Component = () => {
    const [checked, setChecked] = useState(false);

    return (
        <Checkbox checked={checked} onCheckedChange={(checked) => console.log(checked)}>
            <Checkbox.Indicator />
        </Checkbox>
    );
};
