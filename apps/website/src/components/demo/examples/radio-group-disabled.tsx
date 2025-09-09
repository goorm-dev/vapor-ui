import { Radio, RadioGroup } from '@vapor-ui/core';

export default function RadioGroupDisabled() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">개별 아이템 비활성화</h4>
                <RadioGroup.Root name="disabled-items" defaultValue="option1">
                    <Radio.Root value="option1" />
                    <Radio.Root value="option2" disabled />
                    <Radio.Root value="option3" />
                    <Radio.Root value="option4" disabled />
                </RadioGroup.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">전체 그룹 비활성화</h4>
                <RadioGroup.Root name="disabled-group" disabled defaultValue="group1">
                    <Radio.Root value="group1" />
                    <Radio.Root value="group2" />
                    <Radio.Root value="group3" />
                </RadioGroup.Root>
            </div>
        </div>
    );
}
