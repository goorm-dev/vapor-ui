'use client';

import { Field, TextInput } from '@vapor-ui/core';

export default function FieldDescription() {
    return (
        <Field.Root name="email" className="v-space-y-2">
            <Field.Label>이메일 주소</Field.Label>
            <TextInput type="email" placeholder="example@email.com" className="v-w-full" />
            <Field.Description>회원가입 시 사용할 이메일 주소를 입력해주세요.</Field.Description>
        </Field.Root>
    );
}
