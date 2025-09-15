import { Checkbox, Flex } from '@vapor-ui/core';

export default function CheckboxReadOnly() {
    return (
        <Flex gap="$000" flexDirection="column">
            <label className="flex items-center gap-2">
                <Checkbox.Root readOnly defaultChecked>
                    <Checkbox.Indicator />
                </Checkbox.Root>
                읽기 전용 (체크됨)
            </label>
            <label className="flex items-center gap-2">
                <Checkbox.Root readOnly>
                    <Checkbox.Indicator />
                </Checkbox.Root>
                읽기 전용 (체크 안됨)
            </label>
            <label className="flex items-center gap-2">
                <Checkbox.Root readOnly indeterminate>
                    <Checkbox.Indicator />
                </Checkbox.Root>
                읽기 전용 (혼합 상태)
            </label>
        </Flex>
    );
}
