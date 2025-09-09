import { Radio, RadioGroup } from '@vapor-ui/core';

export default function DefaultRadioGroup() {
    return (
        <RadioGroup.Root name="fruits">
            <Radio.Root value="apple" />
            <Radio.Root value="orange" />
        </RadioGroup.Root>
    );
}
