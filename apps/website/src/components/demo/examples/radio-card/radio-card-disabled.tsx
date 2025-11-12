import { HStack, RadioCard, RadioGroup } from '@vapor-ui/core';

export default function RadioCardDisabled() {
    return (
        <div className="space-y-6">
            <RadioGroup.Root name="disabled-group" disabled>
                <RadioGroup.Label>전체 그룹 비활성화</RadioGroup.Label>
                <HStack gap="$100">
                    <RadioCard value="option1">Option 1</RadioCard>
                    <RadioCard value="option2">Option 2</RadioCard>
                    <RadioCard value="option3">Option 3</RadioCard>
                </HStack>
            </RadioGroup.Root>

            <RadioGroup.Root name="individual-disabled">
                <RadioGroup.Label>개별 카드 비활성화</RadioGroup.Label>
                <HStack gap="$100">
                    <RadioCard value="enabled1">Enabled Option</RadioCard>
                    <RadioCard value="disabled1" disabled>
                        Disabled Option
                    </RadioCard>
                    <RadioCard value="enabled2">Another Enabled Option</RadioCard>
                </HStack>
            </RadioGroup.Root>
        </div>
    );
}
