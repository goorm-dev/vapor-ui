import { Checkbox } from '@vapor-ui/core';

export default function CheckboxSize() {
    return (
        <div className="flex items-center gap-4">
            <Checkbox.Root size="md">
                <Checkbox.Control />
                <Checkbox.Label>MD</Checkbox.Label>
            </Checkbox.Root>
            <Checkbox.Root size="lg">
                <Checkbox.Control />
                <Checkbox.Label>LG</Checkbox.Label>
            </Checkbox.Root>
        </div>
    );
}
