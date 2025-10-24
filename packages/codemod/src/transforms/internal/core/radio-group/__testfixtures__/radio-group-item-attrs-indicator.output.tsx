// @ts-nocheck
import React from 'react';
import { RadioGroup, Radio } from '@vapor-ui/core';

export function Example() {
    return (
        <RadioGroup.Root value="1">
            {['a', 'b'].map((id) => (
                <Radio.Root key={id} className="custom-item" value={id} />
            ))}
        </RadioGroup.Root>
    );
}
