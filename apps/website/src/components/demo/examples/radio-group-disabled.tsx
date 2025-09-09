import { Radio, RadioGroup } from '@vapor-ui/core';

export default function RadioGroupDisabled() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">개별 아이템 비활성화</h4>
                <RadioGroup.Root name="disabled-items" defaultValue="option1">
                    <label>
                        <Radio.Root value="option1" />
                        활성 옵션 1
                    </label>

                    <label>
                        <Radio.Root value="option2" disabled />
                        비활성 옵션 2
                    </label>

                    <label>
                        <Radio.Root value="option3" />
                        활성 옵션 3
                    </label>

                    <label>
                        <Radio.Root value="option4" disabled />
                        비활성 옵션 4
                    </label>
                </RadioGroup.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">전체 그룹 비활성화</h4>
                <RadioGroup.Root name="disabled-group" disabled defaultValue="group1">
                    <label>
                        <Radio.Root value="group1" />
                        그룹 옵션 1
                    </label>

                    <label>
                        <Radio.Root value="group2" />
                        그룹 옵션 2
                    </label>

                    <label>
                        <Radio.Root value="group3" />
                        그룹 옵션 3
                    </label>
                </RadioGroup.Root>
            </div>
        </div>
    );
}
