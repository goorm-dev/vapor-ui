import { Radio, RadioGroup } from '@vapor-ui/core';

export default function RadioGroupSimple() {
    return (
        <RadioGroup.Root name="simple" defaultValue="option1">
            <Radio.Root value="option1" />
            <Radio.Root value="option2" />
            <Radio.Root value="option3" />
        </RadioGroup.Root>
    );
}
