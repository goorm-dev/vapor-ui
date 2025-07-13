import { RadioGroup } from '@vapor-ui/core';

export default function DefaultRadioGroup() {
    return (
        <RadioGroup.Root name="fruits">
            <RadioGroup.Item value="apple">
                <RadioGroup.Control />
                <RadioGroup.Label>Apple</RadioGroup.Label>
            </RadioGroup.Item>
            <RadioGroup.Item value="orange">
                <RadioGroup.Control />
                <RadioGroup.Label>Orange</RadioGroup.Label>
            </RadioGroup.Item>
        </RadioGroup.Root>
    );
}
