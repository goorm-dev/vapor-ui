import { RadioGroup } from '@vapor-ui/core';

export default function RadioGroupVisuallyHidden() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">기본 라벨</h4>
                <RadioGroup.Root name="normal-labels" defaultValue="visible1">
                    <RadioGroup.Item value="visible1">
                        <RadioGroup.Control />
                        <RadioGroup.Label>보이는 라벨 1</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="visible2">
                        <RadioGroup.Control />
                        <RadioGroup.Label>보이는 라벨 2</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="visible3">
                        <RadioGroup.Control />
                        <RadioGroup.Label>보이는 라벨 3</RadioGroup.Label>
                    </RadioGroup.Item>
                </RadioGroup.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">시각적으로 숨겨진 라벨</h4>
                <RadioGroup.Root name="hidden-labels" defaultValue="hidden2" visuallyHidden>
                    <RadioGroup.Item value="hidden1">
                        <RadioGroup.Control />
                        <RadioGroup.Label>숨겨진 라벨 1</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="hidden2">
                        <RadioGroup.Control />
                        <RadioGroup.Label>숨겨진 라벨 2</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="hidden3">
                        <RadioGroup.Control />
                        <RadioGroup.Label>숨겨진 라벨 3</RadioGroup.Label>
                    </RadioGroup.Item>
                </RadioGroup.Root>
            </div>
        </div>
    );
}
