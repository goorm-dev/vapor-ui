import { Radio, RadioGroup } from '@vapor-ui/core';

export default function DefaultRadioGroup() {
    return (
        <RadioGroup.Root name="fruits">
            <label className="flex items-center gap-2">
                <Radio.Root value="apple" />
                Apple
            </label>
            <label className="flex items-center gap-2">
                <Radio.Root value="orange" />
                Orange
            </label>
            <label className="flex items-center gap-2">
                <Radio.Root value="banana" disabled />
                Banana (Disabled)
            </label>
        </RadioGroup.Root>
    );
}
