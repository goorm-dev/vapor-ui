'use client';

import { Field, TextInput } from '@vapor-ui/core';

export default function FieldValidationMode() {
    const validateEmail = (value: unknown) => {
        const stringValue = String(value || '');
        if (stringValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
            return '올바른 이메일 형식을 입력해주세요.';
        }
        return null;
    };

    return (
        <div className="v-space-y-4">
            <Field.Root name="name" validationMode="onChange" className="v-space-y-2">
                <Field.Label>이름 (onChange 검증)</Field.Label>
                <TextInput required placeholder="이름을 입력하세요" className="v-w-full" />
                <Field.Description>입력할 때마다 실시간으로 검증됩니다.</Field.Description>
                <Field.Error />
            </Field.Root>

            <Field.Root
                name="email"
                validationMode="onBlur"
                validate={validateEmail}
                className="v-space-y-2"
            >
                <Field.Label>이메일 (onBlur 검증)</Field.Label>
                <TextInput type="email" placeholder="이메일을 입력하세요" className="v-w-full" />
                <Field.Description>입력 필드를 벗어날 때 검증됩니다.</Field.Description>
                <Field.Error />
            </Field.Root>
        </div>
    );
}
