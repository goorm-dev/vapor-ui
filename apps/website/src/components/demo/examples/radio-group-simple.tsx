import { Radio, RadioGroup } from '@vapor-ui/core';

export default function RadioGroupSimple() {
    return (
        <RadioGroup.Root name="simple" defaultValue="option1">
            <label className="flex items-center gap-2">
                <Radio.Root value="option1" />
                Option 1
            </label>
            <label className="flex items-center gap-2">
                <Radio.Root value="option2" />
                Option 2
            </label>
            <label className="flex items-center gap-2">
                <Radio.Root value="option3" />
                Option 3
            </label>
        </RadioGroup.Root>
    );
}
