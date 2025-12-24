// @ts-nocheck
import React from 'react';

import { Radio, RadioGroup } from '@vapor-ui/core';

export function Example() {
    return (
        <RadioGroup.Root defaultValue="1">
            <Radio.Root value="1" />
            <Radio.Root value="2" />
        </RadioGroup.Root>
    );
}
