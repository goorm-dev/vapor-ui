import { RadioGroup } from '@vapor-ui/core';

export default function RadioGroupSize() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">Small</h4>
                <RadioGroup.Root name="size-sm" size="sm">
                    <RadioGroup.Item value="sm1">
                        <RadioGroup.Control />
                        <RadioGroup.Label>Small Option 1</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="sm2">
                        <RadioGroup.Control />
                        <RadioGroup.Label>Small Option 2</RadioGroup.Label>
                    </RadioGroup.Item>
                </RadioGroup.Root>
            </div>
            
            <div>
                <h4 className="text-sm font-medium mb-2">Medium</h4>
                <RadioGroup.Root name="size-md" size="md">
                    <RadioGroup.Item value="md1">
                        <RadioGroup.Control />
                        <RadioGroup.Label>Medium Option 1</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="md2">
                        <RadioGroup.Control />
                        <RadioGroup.Label>Medium Option 2</RadioGroup.Label>
                    </RadioGroup.Item>
                </RadioGroup.Root>
            </div>
            
            <div>
                <h4 className="text-sm font-medium mb-2">Large</h4>
                <RadioGroup.Root name="size-lg" size="lg">
                    <RadioGroup.Item value="lg1">
                        <RadioGroup.Control />
                        <RadioGroup.Label>Large Option 1</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="lg2">
                        <RadioGroup.Control />
                        <RadioGroup.Label>Large Option 2</RadioGroup.Label>
                    </RadioGroup.Item>
                </RadioGroup.Root>
            </div>
        </div>
    );
}