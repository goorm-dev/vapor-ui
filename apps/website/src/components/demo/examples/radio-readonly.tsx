import { Radio, RadioGroup } from '@vapor-ui/core';

export default function RadioReadOnly() {
    return (
        <RadioGroup.Root name="readonly-fruits" defaultValue="apple">
            <label className="flex items-center gap-2">
                <Radio.Root value="apple" readOnly />
                읽기 전용 (선택됨)
            </label>
            <label className="flex items-center gap-2">
                <Radio.Root value="orange" readOnly />
                읽기 전용 (선택 안됨)
            </label>
        </RadioGroup.Root>
    );
}
