// @ts-nocheck
import React from 'react';

import { Field, Radio, RadioGroup } from '@vapor-ui/core';

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
