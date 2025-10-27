// @ts-nocheck
import React from 'react';

import { Field, Radio, RadioGroup } from '@vapor-ui/core';

export function Example() {
    const [value, setValue] = React.useState('male');

    return (
        <RadioGroup.Root value={value} onValueChange={setValue}>
            <Field.Label>
                <Radio.Root value="male" />
                남성
            </Field.Label>
            <Field.Label>
                <Radio.Root value="female" />
                여성
            </Field.Label>
        </RadioGroup.Root>
    );
}
