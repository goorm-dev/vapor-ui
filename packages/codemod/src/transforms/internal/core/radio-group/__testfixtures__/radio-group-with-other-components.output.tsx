// @ts-nocheck
import React from 'react';

import { Field, Radio, RadioGroup } from '@vapor-ui/core';

export function Example() {
    return (
        <div>
            <h1>Select an option</h1>
            <RadioGroup.Root value="1">
                <Field.Label>
                    <Radio.Root value="1" />
                    Option 1
                </Field.Label>
                <Field.Label>
                    <Radio.Root value="2" />
                    Option 2
                </Field.Label>
            </RadioGroup.Root>
            <button>Submit</button>
        </div>
    );
}
