import { Radio } from '@vapor-ui/core';

export default function DefaultRadio() {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <Radio.Root value="option1" />
            Option 1
        </label>
    );
}
