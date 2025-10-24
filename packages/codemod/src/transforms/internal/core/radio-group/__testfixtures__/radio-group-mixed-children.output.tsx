// @ts-nocheck
import React from 'react';
import { RadioGroup, Radio, Field } from '@vapor-ui/core';

export function Example() {
    const extraContent = 'Extra info';
    return (
        <RadioGroup.Root value="1">
            <Field.Label>
                <Radio.Root value="1" />
                Option 1
            </Field.Label>
            Some text content
            {extraContent}
        </RadioGroup.Root>
    );
}
