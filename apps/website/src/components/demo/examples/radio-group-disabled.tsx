import { RadioGroup } from '@vapor-ui/core';

export default function RadioGroupDisabled() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">개별 아이템 비활성화</h4>
                <RadioGroup.Root name="disabled-items" defaultValue="option1">
                    <RadioGroup.Item value="option1">
                        <RadioGroup.Control />
                        <RadioGroup.Label>활성 옵션 1</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="option2" disabled>
                        <RadioGroup.Control />
                        <RadioGroup.Label>비활성 옵션 2</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="option3">
                        <RadioGroup.Control />
                        <RadioGroup.Label>활성 옵션 3</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="option4" disabled>
                        <RadioGroup.Control />
                        <RadioGroup.Label>비활성 옵션 4</RadioGroup.Label>
                    </RadioGroup.Item>
                </RadioGroup.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">전체 그룹 비활성화</h4>
                <RadioGroup.Root name="disabled-group" disabled defaultValue="group1">
                    <RadioGroup.Item value="group1">
                        <RadioGroup.Control />
                        <RadioGroup.Label>그룹 옵션 1</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="group2">
                        <RadioGroup.Control />
                        <RadioGroup.Label>그룹 옵션 2</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="group3">
                        <RadioGroup.Control />
                        <RadioGroup.Label>그룹 옵션 3</RadioGroup.Label>
                    </RadioGroup.Item>
                </RadioGroup.Root>
            </div>
        </div>
    );
}
