// @ts-nocheck
import React from 'react';
import { RadioGroup, Radio, Field } from '@vapor-ui/core';
import { Custom } from './custom';

export function Example() {
    return (
        <RadioGroup.Root value="1">
            <Field.Label>
                <Radio.Root value="1" />
                Option 1
            </Field.Label>
            <Custom.Component>Extra</Custom.Component>
        </RadioGroup.Root>
    );
}
