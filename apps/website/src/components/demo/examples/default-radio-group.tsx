import { Radio, RadioGroup } from '@vapor-ui/core';

export default function DefaultRadioGroup() {
    return (
        <RadioGroup.Root name="fruits">
            <Radio.Root value="apple" />
            <Radio.Root value="orange" />
            <Radio.Root value="banana" disabled />
        </RadioGroup.Root>
    );
}
