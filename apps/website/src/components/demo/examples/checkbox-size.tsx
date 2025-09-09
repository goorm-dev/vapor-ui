import { Checkbox, Text } from '@vapor-ui/core';

export default function CheckboxSize() {
    return (
        <div className="flex items-center gap-4">
            <Text typography="body2" render={<label />}>
                <Checkbox.Root size="md" />
                MD
            </Text>
            <Text typography="body2" render={<label />}>
                <Checkbox.Root size="lg" />
                LG
            </Text>
        </div>
    );
}
