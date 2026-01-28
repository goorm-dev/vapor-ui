'use client';

import { Field, TextInput, VStack } from '@vapor-ui/core';

export default function FieldValidationMode() {
    const validateUsername = (value: unknown) => {
        const stringValue = String(value || '');

        if (stringValue.length < 3) return '사용자 이름은 3자 이상이어야 합니다.';
        if (stringValue.length > 20) return '사용자 이름은 20자 이하여야 합니다.';
        if (!/^[a-zA-Z0-9_]+$/.test(stringValue))
            return '영문, 숫자, 언더스코어만 사용할 수 있습니다.';

        return null;
    };

    const validateEmail = (value: unknown) => {
        const stringValue = String(value || '');
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!stringValue) return '이메일을 입력해주세요.';
        if (!EMAIL_REGEX.test(stringValue)) return '올바른 이메일 형식을 입력해주세요.';

        return null;
    };

    return (
        <VStack gap="$200">
            <Field.Root name="username" validationMode="onChange" validate={validateUsername}>
                <Field.Label flexDirection="column">
                    사용자 이름 (onChange 검증)
                    <TextInput placeholder="영문, 숫자, _ 만 허용" />
                </Field.Label>

                <Field.Description>입력할 때마다 실시간으로 검증됩니다.</Field.Description>
                <Field.Error />
                <Field.Success>사용 가능한 사용자 이름입니다.</Field.Success>
            </Field.Root>

            <Field.Root name="email" validationMode="onBlur" validate={validateEmail}>
                <Field.Label flexDirection="column">
                    이메일 (onBlur 검증)
                    <TextInput type="email" placeholder="이메일을 입력하세요" />
                </Field.Label>

                <Field.Description>입력 필드를 벗어날 때 검증됩니다.</Field.Description>
                <Field.Error />
            </Field.Root>
        </VStack>
    );
}
