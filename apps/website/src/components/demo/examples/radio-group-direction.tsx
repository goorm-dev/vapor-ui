import { RadioGroup } from '@vapor-ui/core';

export default function RadioGroupDirection() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">Vertical (기본값)</h4>
                <RadioGroup.Root name="orientation-vertical" orientation="vertical">
                    <RadioGroup.Item value="v1">
                        <RadioGroup.Control />
                        <RadioGroup.Label>Vertical Option 1</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="v2">
                        <RadioGroup.Control />
                        <RadioGroup.Label>Vertical Option 2</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="v3">
                        <RadioGroup.Control />
                        <RadioGroup.Label>Vertical Option 3</RadioGroup.Label>
                    </RadioGroup.Item>
                </RadioGroup.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Horizontal</h4>
                <RadioGroup.Root name="orientation-horizontal" orientation="horizontal">
                    <RadioGroup.Item value="h1">
                        <RadioGroup.Control />
                        <RadioGroup.Label>Option 1</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="h2">
                        <RadioGroup.Control />
                        <RadioGroup.Label>Option 2</RadioGroup.Label>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="h3">
                        <RadioGroup.Control />
                        <RadioGroup.Label>Option 3</RadioGroup.Label>
                    </RadioGroup.Item>
                </RadioGroup.Root>
            </div>
        </div>
    );
}
