// @ts-nocheck
import React from 'react';

import { Field, Radio, RadioGroup } from '@vapor-ui/core';

export function Example() {
    const props = {
        size: 'md' as const,
        invalid: false,
    };

    return (
        <RadioGroup.Root {...props} value="1">
            <Field.Label>
                <Radio.Root value="1" />
                Option 1
            </Field.Label>
        </RadioGroup.Root>
    );
}
