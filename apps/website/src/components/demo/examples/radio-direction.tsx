import { HStack, Radio, RadioGroup, VStack } from '@vapor-ui/core';

export default function RadioDirection() {
    return (
        <div className="space-y-6">
            <RadioGroup.Root name="direction-vertical" defaultValue="v1">
                <RadioGroup.Label>Vertical (기본값)</RadioGroup.Label>
                <VStack gap="$100">
                    <label className="flex items-center gap-2">
                        <Radio.Root value="v1" />
                        Option 1
                    </label>
                    <label className="flex items-center gap-2">
                        <Radio.Root value="v2" />
                        Option 2
                    </label>
                    <label className="flex items-center gap-2">
                        <Radio.Root value="v3" />
                        Option 3
                    </label>
                </VStack>
            </RadioGroup.Root>

            <RadioGroup.Root name="direction-horizontal" defaultValue="h1">
                <RadioGroup.Label>Horizontal</RadioGroup.Label>
                <HStack gap="$200">
                    <label className="flex items-center gap-2">
                        <Radio.Root value="h1" />
                        Option 1
                    </label>
                    <label className="flex items-center gap-2">
                        <Radio.Root value="h2" />
                        Option 2
                    </label>
                    <label className="flex items-center gap-2">
                        <Radio.Root value="h3" />
                        Option 3
                    </label>
                </HStack>
            </RadioGroup.Root>
        </div>
    );
}
