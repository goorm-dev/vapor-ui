'use client';

import { Box, Field, TextInput } from '@vapor-ui/core';

export default function DefaultField() {
    return (
        <Box width="300px">
            <Field.Root name="username">
                <Field.VLabel>
                    Field.Label
                    <TextInput placeholder="사용자명을 입력하세요" />
                </Field.VLabel>
                <Field.Description>Field.Description</Field.Description>
                <Field.Error match={true}>Field.Error</Field.Error>
                <Field.Success>Field.Success</Field.Success>
            </Field.Root>
        </Box>
    );
}
