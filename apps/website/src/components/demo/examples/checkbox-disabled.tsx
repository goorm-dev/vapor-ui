import { Checkbox, Text } from '@vapor-ui/core';

export default function CheckboxDisabled() {
    return (
        <div className="flex items-center gap-4">
            <Text typography="body2" render={<label />}>
                <Checkbox.Root disabled />
                Disabled
            </Text>
            <Text typography="body2" render={<label />}>
                <Checkbox.Root disabled checked />
                Disabled Checked
            </Text>
        </div>
    );
}
