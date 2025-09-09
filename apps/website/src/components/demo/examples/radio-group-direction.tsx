import { Radio, RadioGroup } from '@vapor-ui/core';

export default function RadioGroupDirection() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">Vertical (기본값)</h4>
                <RadioGroup.Root name="orientation-vertical" orientation="vertical">
                    <Radio.Root value="v1" />
                    <Radio.Root value="v2" />
                    <Radio.Root value="v3" />
                </RadioGroup.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Horizontal</h4>
                <RadioGroup.Root name="orientation-horizontal" orientation="horizontal">
                    <Radio.Root value="h1" />
                    <Radio.Root value="h2" />
                    <Radio.Root value="h3" />
                </RadioGroup.Root>
            </div>
        </div>
    );
}
