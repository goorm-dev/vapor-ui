// @ts-nocheck
import React from 'react';

import { Field, Radio, RadioGroup } from '@vapor-ui/core';

export function Example() {
    return (
        <RadioGroup.Root value="1" onValueChange={() => {}}>
            <Field.Label>
                <Radio.Root value="1" />
                Option 1
            </Field.Label>
            <Field.Label>
                <Radio.Root value="2" disabled />
                Option 2 (Disabled)
            </Field.Label>
        </RadioGroup.Root>
    );
}
