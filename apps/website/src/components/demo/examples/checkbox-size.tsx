import { Checkbox } from '@vapor-ui/core';

export default function CheckboxSize() {
    return (
        <div className="flex items-center gap-4">
            <Checkbox.Root size="md" />
            <Checkbox.Root size="lg" />
        </div>
    );
}
