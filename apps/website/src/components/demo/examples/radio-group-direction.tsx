import { Radio, RadioGroup } from '@vapor-ui/core';

export default function RadioGroupDirection() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">Vertical (기본값)</h4>
                <RadioGroup.Root name="orientation-vertical" orientation="vertical">
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
                </RadioGroup.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Horizontal</h4>
                <RadioGroup.Root name="orientation-horizontal" orientation="horizontal">
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
                </RadioGroup.Root>
            </div>
        </div>
    );
}
