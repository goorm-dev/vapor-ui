// @ts-nocheck
import React from 'react';
import { RadioGroup, Radio, Field } from '@vapor-ui/core';

export function Example() {
    return (
        <RadioGroup.Root size="md" orientation="horizontal" invalid={true} defaultValue="option1">
            <Field.Label>
                <Radio.Root value="option1" />
                Option 1
            </Field.Label>
            <Field.Label>
                <Radio.Root value="option2" />
                Option 2
            </Field.Label>
        </RadioGroup.Root>
    );
}
