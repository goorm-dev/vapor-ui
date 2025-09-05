import { RadioGroup } from '@vapor-ui/core';

export default function DefaultRadioGroup() {
    return (
        <RadioGroup.Root name="fruits">
            <RadioGroup.Item value="apple">
                <RadioGroup.Control />
                Apple
            </RadioGroup.Item>
            <RadioGroup.Item value="orange">
                <RadioGroup.Control />
                Orange
            </RadioGroup.Item>
        </RadioGroup.Root>
    );
}
