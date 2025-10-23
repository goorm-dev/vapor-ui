// @ts-nocheck
import React from 'react';
import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    const [value, setValue] = React.useState('male');

    return (
        <RadioGroup selectedValue={value} onSelectedValueChange={setValue}>
            <RadioGroup.Item>
                <RadioGroup.Indicator value="male" />
                <RadioGroup.Label>남성</RadioGroup.Label>
            </RadioGroup.Item>
            <RadioGroup.Item>
                <RadioGroup.Indicator value="female" />
                <RadioGroup.Label>여성</RadioGroup.Label>
            </RadioGroup.Item>
        </RadioGroup>
    );
}
