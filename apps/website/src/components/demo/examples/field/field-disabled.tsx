'use client';

import { Field, TextInput } from '@vapor-ui/core';

export default function FieldDisabled() {
    return (
        <Field.Root name="readonly" disabled className="v-space-y-2">
            <Field.Label>읽기 전용 필드</Field.Label>
            <TextInput value="이 필드는 수정할 수 없습니다" disabled className="v-w-full" />
            <Field.Description>이 필드는 현재 비활성화되어 수정할 수 없습니다.</Field.Description>
        </Field.Root>
    );
}
