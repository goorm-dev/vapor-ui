import { Checkbox } from '@vapor-ui/core';

export default function CheckboxVisuallyHidden() {
    return (
        <div className="flex items-center gap-4">
            <Checkbox.Root visuallyHidden>
                <Checkbox.Control />
                <Checkbox.Label>Visually Hidden</Checkbox.Label>
            </Checkbox.Root>
        </div>
    );
}
