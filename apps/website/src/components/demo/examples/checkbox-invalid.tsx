import { Checkbox, Text } from '@vapor-ui/core';

export default function CheckboxInvalid() {
    return (
        <div className="flex items-center gap-4">
            <Text typography="body2" render={<label />}>
                <Checkbox.Root invalid />
                Invalid
            </Text>
            <Text typography="body2" render={<label />}>
                <Checkbox.Root invalid checked />
                Invalid Checked
            </Text>
        </div>
    );
}
