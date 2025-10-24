// @ts-nocheck
import React from 'react';
import { RadioGroup } from '@goorm-dev/vapor-core';
import { Custom } from './custom';

export function Example() {
    return (
        <RadioGroup value="1">
            <RadioGroup.Item>
                <RadioGroup.Indicator value="1" />
                <RadioGroup.Label>Option 1</RadioGroup.Label>
                <Custom.Component>Extra</Custom.Component>
            </RadioGroup.Item>
        </RadioGroup>
    );
}
