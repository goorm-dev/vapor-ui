'use client';

import { Field, TextInput } from '@vapor-ui/core';

export default function FieldValidation() {
    return (
        <Field.Root name="password" validationMode="onChange" className="v-space-y-2">
            <Field.Label>비밀번호</Field.Label>
            <TextInput
                required
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="v-w-full"
            />
            <Field.Error>비밀번호를 입력해주세요.</Field.Error>
            <Field.Success>✓ 사용 가능한 비밀번호입니다.</Field.Success>
        </Field.Root>
    );
}
