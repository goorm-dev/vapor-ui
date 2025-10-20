'use client';

import { Box, Field, TextInput } from '@vapor-ui/core';

export default function FieldValidation() {
    return (
        <Box width="300px">
            <Field.Root name="password" validationMode="onChange">
                <Box render={<Field.Label />} flexDirection="column">
                    비밀번호
                    <TextInput type="password" required placeholder="비밀번호를 입력하세요" />
                </Box>
                <Field.Error match="valueMissing">비밀번호를 입력해주세요.</Field.Error>
                <Field.Success>✓ 사용 가능한 비밀번호입니다.</Field.Success>
            </Field.Root>
        </Box>
    );
}
