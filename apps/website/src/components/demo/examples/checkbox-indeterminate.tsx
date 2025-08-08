import { Checkbox } from '@vapor-ui/core';

export default function CheckboxIndeterminate() {
    return (
        <div className="flex items-center gap-4">
            <Checkbox.Root indeterminate>
                <Checkbox.Control />
                <Checkbox.Label>Indeterminate</Checkbox.Label>
            </Checkbox.Root>
        </div>
    );
}
