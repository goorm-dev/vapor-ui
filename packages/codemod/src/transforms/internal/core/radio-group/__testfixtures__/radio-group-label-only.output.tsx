// @ts-nocheck
import React from 'react';
import { RadioGroup, Radio, Field } from '@vapor-ui/core';

export function Example() {
    return (
        <RadioGroup.Root value="1">
            <Field.Label key="item1">Label Only</Field.Label>
        </RadioGroup.Root>
    );
}
