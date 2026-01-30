import { Checkbox, HStack } from '@vapor-ui/core';

export default function CheckboxReadOnly() {
    return (
        <HStack gap="$100">
            <Checkbox.Root size="lg" readOnly defaultChecked />
            <Checkbox.Root size="lg" readOnly />
            <Checkbox.Root size="lg" readOnly indeterminate />
        </HStack>
    );
}
