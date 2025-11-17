import { Radio, RadioGroup, VStack } from '@vapor-ui/core';

export default function Flexible() {
    return (
        <div className="space-y-6">
            <RadioGroup.Root name="direction-vertical" defaultValue="v1">
                <RadioGroup.Label>Vertical (기본값)</RadioGroup.Label>
                <VStack gap="$100">
                    <label className="flex items-center gap-2">
                        <Radio.Root value="v1">
                            <Radio.IndicatorPrimitive />
                        </Radio.Root>
                        Option 1
                    </label>
                    <label className="flex items-center gap-2">
                        <Radio.Root value="v2">
                            <Radio.IndicatorPrimitive />
                        </Radio.Root>
                        Option 2
                    </label>
                    <label className="flex items-center gap-2">
                        <Radio.Root value="v3">
                            <Radio.IndicatorPrimitive />
                        </Radio.Root>
                        Option 3
                    </label>
                </VStack>
            </RadioGroup.Root>
        </div>
    );
}
