import { Checkbox } from '@vapor-ui/core';

export default function CheckboxPreview() {
    return (
        <Checkbox.Root>
            <Checkbox.Control />
            <Checkbox.Label>동의</Checkbox.Label>
        </Checkbox.Root>
    );
}
