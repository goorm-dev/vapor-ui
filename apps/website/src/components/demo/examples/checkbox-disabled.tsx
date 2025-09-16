import { Checkbox } from '@vapor-ui/core';

export default function CheckboxDisabled() {
    return (
        <div className="flex items-center gap-4">
            <Checkbox.Root disabled />
            <Checkbox.Root disabled checked />
        </div>
    );
}
