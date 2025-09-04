import { Checkbox } from '@vapor-ui/core';

export default function CheckboxReadOnly() {
    return (
        <div className="space-y-3">
            <Checkbox.Root readOnly defaultChecked>
                <Checkbox.Control />
                <Checkbox.Label>읽기 전용 (체크됨)</Checkbox.Label>
            </Checkbox.Root>
            <Checkbox.Root readOnly>
                <Checkbox.Control />
                <Checkbox.Label>읽기 전용 (체크 안됨)</Checkbox.Label>
            </Checkbox.Root>
            <Checkbox.Root readOnly indeterminate>
                <Checkbox.Control />
                <Checkbox.Label>읽기 전용 (혼합 상태)</Checkbox.Label>
            </Checkbox.Root>
        </div>
    );
}
