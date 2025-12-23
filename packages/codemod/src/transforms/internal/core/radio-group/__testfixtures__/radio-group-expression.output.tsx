// @ts-nocheck
import React from 'react';

import { Field, Radio, RadioGroup } from '@vapor-ui/core';

export function Example() {
    const options = ['option1', 'option2', 'option3'];

    return (
        <RadioGroup.Root value={options[0]}>
            {options.map((opt) => (
                <Field.Label key={opt}>
                    <Radio.Root value={opt} />
                    {opt}
                </Field.Label>
            ))}
        </RadioGroup.Root>
    );
}
