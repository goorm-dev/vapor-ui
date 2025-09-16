import { Radio, RadioGroup } from '@vapor-ui/core';

export default function RadioGroupDisabled() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">개별 아이템 비활성화</h4>
                <RadioGroup.Root name="disabled-items" defaultValue="option1">
                    <label className="flex items-center gap-2">
                        <Radio.Root value="option1" />
                        Option 1 (Default)
                    </label>
                    <label className="flex items-center gap-2">
                        <Radio.Root value="option2" />
                        Option 2 (Default)
                    </label>
                    <label className="flex items-center gap-2">
                        <Radio.Root value="option3" disabled />
                        Option 3 (Disabled)
                    </label>
                </RadioGroup.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">전체 그룹 비활성화</h4>
                <RadioGroup.Root name="disabled-group" disabled defaultValue="group1">
                    <label className="flex items-center gap-2">
                        <Radio.Root value="group1" />
                        Group 1
                    </label>
                    <label className="flex items-center gap-2">
                        <Radio.Root value="group2" />
                        Group 2
                    </label>
                    <label className="flex items-center gap-2">
                        <Radio.Root value="group3" />
                        Group 3
                    </label>
                </RadioGroup.Root>
            </div>
        </div>
    );
}
