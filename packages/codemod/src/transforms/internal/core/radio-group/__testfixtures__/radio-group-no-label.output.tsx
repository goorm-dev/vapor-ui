// @ts-nocheck
import React from 'react';

import { Radio, RadioGroup } from '@vapor-ui/core';

export function Example() {
    return (
        <RadioGroup.Root value="option1">
            <Radio.Root value="option1" />
            <Radio.Root value="option2" />
            <Radio.Root value="option3" />
        </RadioGroup.Root>
    );
}
