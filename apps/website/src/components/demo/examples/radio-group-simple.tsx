import { Radio, RadioGroup } from '@vapor-ui/core';

export default function RadioGroupSimple() {
    return (
        <RadioGroup.Root name="simple" defaultValue="option1">
            <label>
                <Radio.Root value="option1" />첫 번째 옵션
            </label>
            <label>
                <Radio.Root value="option2" />두 번째 옵션
            </label>
            <label>
                <Radio.Root value="option3" />세 번째 옵션
            </label>
        </RadioGroup.Root>
    );
}
