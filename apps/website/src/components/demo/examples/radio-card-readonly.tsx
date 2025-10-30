import { HStack, RadioCard, RadioGroup } from '@vapor-ui/core';

export default function RadioCardReadonly() {
    return (
        <div className="space-y-6">
            <RadioGroup.Root name="readonly-group" readOnly defaultValue="selected">
                <RadioGroup.Label>읽기 전용 상태</RadioGroup.Label>
                    <HStack gap="$100">
                        <RadioCard value="unselected">Unselected Option</RadioCard>
                        <RadioCard value="selected">Selected Option (Read Only)</RadioCard>
                        <RadioCard value="another">Another Option</RadioCard>
                    </HStack>
            </RadioGroup.Root>

            <RadioGroup.Root name="normal-group" defaultValue="selected-normal">
                <RadioGroup.Label>일반 상태 (비교용)</RadioGroup.Label>
                    <HStack gap="$100">
                        <RadioCard value="unselected-normal">Unselected Option</RadioCard>
                        <RadioCard value="selected-normal">Selected Option (Editable)</RadioCard>
                        <RadioCard value="another-normal">Another Option</RadioCard>
                    </HStack>
            </RadioGroup.Root>
        </div>
    );
}
