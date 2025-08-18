import { RadioGroup } from '@vapor-ui/core';

export default function RadioGroupSimple() {
    return (
        <RadioGroup.Root name="simple" defaultValue="option1">
            <RadioGroup.Item value="option1">
                <RadioGroup.Control />
                <RadioGroup.Label>첫 번째 옵션</RadioGroup.Label>
            </RadioGroup.Item>
            <RadioGroup.Item value="option2">
                <RadioGroup.Control />
                <RadioGroup.Label>두 번째 옵션</RadioGroup.Label>
            </RadioGroup.Item>
            <RadioGroup.Item value="option3">
                <RadioGroup.Control />
                <RadioGroup.Label>세 번째 옵션</RadioGroup.Label>
            </RadioGroup.Item>
        </RadioGroup.Root>
    );
}