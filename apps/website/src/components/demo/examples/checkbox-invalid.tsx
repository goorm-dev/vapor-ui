import { Checkbox } from '@vapor-ui/core';

export default function CheckboxInvalid() {
    return (
        <div className="flex items-center gap-4">
            <Checkbox.Root invalid>
                <Checkbox.Control />
                <Checkbox.Label>Invalid</Checkbox.Label>
            </Checkbox.Root>
            <Checkbox.Root invalid checked>
                <Checkbox.Control />
                <Checkbox.Label>Invalid Checked</Checkbox.Label>
            </Checkbox.Root>
        </div>
    );
}
