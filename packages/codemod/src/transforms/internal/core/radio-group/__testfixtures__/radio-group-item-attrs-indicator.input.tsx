// @ts-nocheck
import React from 'react';

import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    return (
        <RadioGroup value="1">
            {['a', 'b'].map((id) => (
                <RadioGroup.Item key={id} className="custom-item">
                    <RadioGroup.Indicator value={id} />
                </RadioGroup.Item>
            ))}
        </RadioGroup>
    );
}
