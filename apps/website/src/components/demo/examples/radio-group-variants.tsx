import { RadioGroup } from '@vapor-ui/core';

export default function RadioGroupVariants() {
    return (
        <div className="space-y-6">
            <RadioGroup.Root name="variant1" size="sm" orientation="horizontal" defaultValue="sm1">
                <RadioGroup.Item value="sm1">
                    <RadioGroup.Control />
                    <RadioGroup.Label>Small H1</RadioGroup.Label>
                </RadioGroup.Item>
                <RadioGroup.Item value="sm2">
                    <RadioGroup.Control />
                    <RadioGroup.Label>Small H2</RadioGroup.Label>
                </RadioGroup.Item>
                <RadioGroup.Item value="sm3">
                    <RadioGroup.Control />
                    <RadioGroup.Label>Small H3</RadioGroup.Label>
                </RadioGroup.Item>
            </RadioGroup.Root>
            
            <RadioGroup.Root name="variant2" size="md" orientation="vertical" defaultValue="md2">
                <RadioGroup.Item value="md1">
                    <RadioGroup.Control />
                    <RadioGroup.Label>Medium Vertical 1</RadioGroup.Label>
                </RadioGroup.Item>
                <RadioGroup.Item value="md2">
                    <RadioGroup.Control />
                    <RadioGroup.Label>Medium Vertical 2</RadioGroup.Label>
                </RadioGroup.Item>
                <RadioGroup.Item value="md3" disabled>
                    <RadioGroup.Control />
                    <RadioGroup.Label>Medium Vertical 3 (비활성화)</RadioGroup.Label>
                </RadioGroup.Item>
            </RadioGroup.Root>
            
            <RadioGroup.Root name="variant3" size="lg" orientation="horizontal" defaultValue="lg3">
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