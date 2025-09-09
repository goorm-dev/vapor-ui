import { Checkbox } from '@vapor-ui/core';

export default function CheckboxInvalid() {
    return (
        <div className="flex items-center gap-4">
            <Checkbox.Root invalid />
            <Checkbox.Root invalid checked />
        </div>
    );
}
