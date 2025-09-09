import { Radio, RadioGroup } from '@vapor-ui/core';

export default function RadioGroupSize() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">Medium</h4>
                <RadioGroup.Root name="size-md" size="md">
                    <Radio.Root value="md1" />
                    <Radio.Root value="md2" />
                </RadioGroup.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Large</h4>
                <RadioGroup.Root name="size-lg" size="lg">
                    <Radio.Root value="lg1" />
                    <Radio.Root value="lg2" />
                </RadioGroup.Root>
            </div>
        </div>
    );
}
