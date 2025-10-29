'use client';

import { Box, Field, TextInput } from '@vapor-ui/core';

export default function FieldDescription() {
    return (
        <Box width="300px">
            <Field.Root name="email">
                <Box render={<Field.Label />} flexDirection="column">
                    이메일 주소
                    <TextInput type="email" placeholder="example@email.com" />
                </Box>
                <Field.Description>
                    회원가입 시 사용할 이메일 주소를 입력해주세요.
                </Field.Description>
            </Field.Root>
        </Box>
    );
}
