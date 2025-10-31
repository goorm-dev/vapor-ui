import { RadioGroup } from '@goorm-dev/vapor-core';

export function Example() {
    return (
        <div>
            <RadioGroup defaultSelectedValue="a">
                <RadioGroup.Item>
                    <RadioGroup.Indicator value="a" />
                    <RadioGroup.Label>A</RadioGroup.Label>
                </RadioGroup.Item>
            </RadioGroup>
            <RadioGroup defaultSelectedValue="x">
                <RadioGroup.Item>
                    <RadioGroup.Indicator value="x" />
                    <RadioGroup.Label>X</RadioGroup.Label>
                </RadioGroup.Item>
            </RadioGroup>
        </div>
    );
}
