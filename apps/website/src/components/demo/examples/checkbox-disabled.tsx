import { Checkbox } from '@vapor-ui/core';

export default function CheckboxDisabled() {
    return (
        <div className="flex items-center gap-4">
            <Checkbox.Root disabled>
                <Checkbox.Control />
                <Checkbox.Label>Disabled</Checkbox.Label>
            </Checkbox.Root>
            <Checkbox.Root disabled checked>
                <Checkbox.Control />
                <Checkbox.Label>Disabled Checked</Checkbox.Label>
            </Checkbox.Root>
        </div>
    );
}
