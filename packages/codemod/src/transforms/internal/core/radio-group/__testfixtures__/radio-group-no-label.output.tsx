// @ts-nocheck
import React from 'react';
import { RadioGroup, Radio } from '@vapor-ui/core';

export function Example() {
    return (
        <RadioGroup.Root value="option1">
            <Radio.Root value="option1" />
            <Radio.Root value="option2" />
            <Radio.Root value="option3" />
        </RadioGroup.Root>
    );
}
