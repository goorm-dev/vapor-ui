'use client';

import { Box, Field, TextInput } from '@vapor-ui/core';

export default function FieldDisabled() {
    return (
        <Field.Root name="disabled" disabled>
            <Box render={<Field.Label />} flexDirection="column">
                비활성 필드
                <TextInput value="이 필드는 수정할 수 없습니다" />
            </Box>

            <Field.Description>이 필드는 현재 비활성화되어 수정할 수 없습니다.</Field.Description>
        </Field.Root>
    );
}
