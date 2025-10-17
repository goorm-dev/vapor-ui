'use client';

import { Checkbox, Field } from '@vapor-ui/core';

export default function FieldCheckbox() {
    return (
        <Field.Root name="agreement">
            <Field.HLabel>
                <Checkbox.Root />
                이용약관에 동의합니다
            </Field.HLabel>
            <Field.Description>서비스 이용을 위해 이용약관에 동의해주세요.</Field.Description>
        </Field.Root>
    );
}
