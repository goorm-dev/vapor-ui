import { Radio, RadioGroup } from '@vapor-ui/core';

export default function RadioGroupSize() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">Medium</h4>
                <RadioGroup.Root name="size-md" size="md">
                    <label className="flex items-center gap-2">
                        <Radio.Root value="md1" />
                        Medium Option 1
                    </label>
                    <label className="flex items-center gap-2">
                        <Radio.Root value="md2" />
                        Medium Option 2
                    </label>
                </RadioGroup.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Large</h4>
                <RadioGroup.Root name="size-lg" size="lg">
                    <label className="flex items-center gap-2">
                        <Radio.Root value="lg1" />
                        Large Option 1
                    </label>
                    <label className="flex items-center gap-2">
                        <Radio.Root value="lg2" />
                        Large Option 2
                    </label>
                </RadioGroup.Root>
            </div>
        </div>
    );
}
