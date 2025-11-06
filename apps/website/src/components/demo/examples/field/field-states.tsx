'use client';

import { Box, Field, TextInput, VStack } from '@vapor-ui/core';

export default function FieldStates() {
    return (
        <VStack gap="$200" width="300px">
            <Field.Root name="normal">
                <Box render={<Field.Label />} flexDirection="column">
                    일반 상태
                    <TextInput placeholder="일반 입력 필드" />
                </Box>

                <Field.Description>일반적인 필드 상태입니다.</Field.Description>
            </Field.Root>

            <Field.Root name="error">
                <Box render={<Field.Label />} flexDirection="column">
                    오류 상태
                    <TextInput placeholder="오류가 있는 필드" invalid />
                </Box>

                <Field.Error match={true}>필수 입력 항목입니다. 값을 입력해주세요.</Field.Error>
            </Field.Root>

            <Field.Root name="success">
                <Box render={<Field.Label />} flexDirection="column">
                    성공 상태
                    <TextInput placeholder="유효한 필드" defaultValue="valid@example.com" />
                </Box>

                <Field.Success>올바른 이메일 형식입니다.</Field.Success>
            </Field.Root>

            {/* Disabled State */}
            <Field.Root name="disabled" disabled>
                <Box render={<Field.Label />} flexDirection="column">
                    비활성화 상태
                    <TextInput placeholder="비활성화된 필드" />
                </Box>
                <Field.Description>이 필드는 현재 비활성화되어 있습니다.</Field.Description>
            </Field.Root>
        </VStack>
    );
}
