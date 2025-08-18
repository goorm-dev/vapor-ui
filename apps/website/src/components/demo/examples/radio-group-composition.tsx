import { RadioGroup } from '@vapor-ui/core';

export default function RadioGroupComposition() {
    return (
        <RadioGroup.Root name="composition" size="md" defaultValue="react">
            <RadioGroup.Item value="react">
                <RadioGroup.Control />
                <RadioGroup.Label>React</RadioGroup.Label>
            </RadioGroup.Item>
            <RadioGroup.Item value="vue">
                <RadioGroup.Control />
                <RadioGroup.Label>Vue.js</RadioGroup.Label>
            </RadioGroup.Item>
            <RadioGroup.Item value="angular">
                <RadioGroup.Control />
                <RadioGroup.Label>Angular</RadioGroup.Label>
            </RadioGroup.Item>
            <RadioGroup.Item value="svelte" disabled>
                <RadioGroup.Control />
                <RadioGroup.Label>Svelte (준비 중)</RadioGroup.Label>
            </RadioGroup.Item>
        </RadioGroup.Root>
    );
}