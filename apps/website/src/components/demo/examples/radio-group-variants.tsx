import { RadioGroup } from '@vapor-ui/core';

export default function RadioGroupVariants() {
    return (
        <div className="space-y-6">
            <RadioGroup.Root name="variant1" size="md" orientation="horizontal" defaultValue="md2">
                <RadioGroup.Item value="md1">
                    <RadioGroup.Control />
                    <RadioGroup.Label>Medium H1</RadioGroup.Label>
                </RadioGroup.Item>
                <RadioGroup.Item value="md2">
                    <RadioGroup.Control />
                    <RadioGroup.Label>Medium H2</RadioGroup.Label>
                </RadioGroup.Item>
                <RadioGroup.Item value="md3" disabled>
                    <RadioGroup.Control />
                    <RadioGroup.Label>Medium H3 (비활성화)</RadioGroup.Label>
                </RadioGroup.Item>
            </RadioGroup.Root>

            <RadioGroup.Root name="variant2" size="lg" orientation="horizontal" defaultValue="lg3">
                <RadioGroup.Item value="lg1">
                    <RadioGroup.Control />
                    <RadioGroup.Label>Large H1</RadioGroup.Label>
                </RadioGroup.Item>
                <RadioGroup.Item value="lg2">
                    <RadioGroup.Control />
                    <RadioGroup.Label>Large H2</RadioGroup.Label>
                </RadioGroup.Item>
                <RadioGroup.Item value="lg3">
                    <RadioGroup.Control />
                    <RadioGroup.Label>Large H3</RadioGroup.Label>
                </RadioGroup.Item>
            </RadioGroup.Root>
        </div>
    );
}
