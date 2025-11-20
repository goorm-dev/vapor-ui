'use client';

import { Box, Field, Text, TextInput } from '@vapor-ui/core';

export default function DefaultField() {
    return (
        <Box width="300px">
            <Field.Root name="username">
                <Box render={<Field.Label />} flexDirection="column">
                    <Text typography="subtitle2" foreground="normal-200">
                        Field.Label
                    </Text>
                    <TextInput placeholder="사용자명을 입력하세요" />
                </Box>
                <Field.Description>Field.Description</Field.Description>
                <Field.Error match={true}>Field.Error</Field.Error>
                <Field.Success>Field.Success</Field.Success>
            </Field.Root>
        </Box>
    );
}
