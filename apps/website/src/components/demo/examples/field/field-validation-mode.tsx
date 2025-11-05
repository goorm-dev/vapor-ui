'use client';

import { Box, Field, TextInput, VStack } from '@vapor-ui/core';

export default function FieldValidationMode() {
    const validateEmail = (value: unknown) => {
        const stringValue = String(value || '');
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!EMAIL_REGEX.test(stringValue)) return '올바른 이메일 형식을 입력해주세요.';

        return null;
    };

    return (
        <VStack gap="$200">
            <Field.Root name="name" validationMode="onChange">
                <Box render={<Field.Label />} flexDirection="column">
                    이름 (onChange 검증)
                    <TextInput required placeholder="이름을 입력하세요" />
                </Box>

                <Field.Description>입력할 때마다 실시간으로 검증됩니다.</Field.Description>
                <Field.Error />
            </Field.Root>

            <Field.Root name="email" validationMode="onBlur" validate={validateEmail}>
                <Box render={<Field.Label />} flexDirection="column">
                    이메일 (onBlur 검증)
                    <TextInput type="email" placeholder="이메일을 입력하세요" />
                </Box>

                <Field.Description>입력 필드를 벗어날 때 검증됩니다.</Field.Description>
                <Field.Error />
            </Field.Root>
        </VStack>
    );
}
