'use client';

import { Box, Field, TextInput } from '@vapor-ui/core';

export default function FieldInvalid() {
    // 공식 문서에 따라 custom error 타입 객체 반환
    const validate = (value: unknown) => {
        const email = String(value);
        const EMAIL_REGEX =
            /^[a-zA-Z0-9]{1}[a-zA-Z0-9-_.]*@[a-zA-Z0-9-]+.[a-zA-Z0-9-_]+(.[a-zA-Z0-9-_]+)?$/;

        if (!EMAIL_REGEX.test(email)) return '올바른 이메일 형식을 입력해주세요.';

        return null;
    };

    return (
        <Box width="300px">
            <Field.Root name="email" validationMode="onChange" validate={validate}>
                <Box render={<Field.Label />} flexDirection="column">
                    이메일
                    <TextInput type="email" placeholder="이메일을 입력하세요" />
                </Box>

                <Field.Error />
            </Field.Root>
        </Box>
    );
}
