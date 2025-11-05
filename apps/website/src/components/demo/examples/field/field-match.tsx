'use client';

import { useState } from 'react';

import { Box, Field, TextInput, VStack } from '@vapor-ui/core';

export default function FieldMatch() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <VStack gap="$200" width="300px">
            <Field.Root name="password" validationMode="onBlur">
                <Box render={<Field.Label />} flexDirection="column">
                    비밀번호
                    <TextInput
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onValueChange={(value) => setPassword(value)}
                        placeholder="비밀번호를 입력하세요"
                    />
                </Box>

                <Field.Description>최소 8자 이상 입력해주세요.</Field.Description>
                <Field.Error match="valueMissing">비밀번호를 입력해주세요.</Field.Error>
                <Field.Error match="tooShort">비밀번호는 최소 8자 이상이어야 합니다.</Field.Error>
            </Field.Root>

            <Field.Root name="confirmPassword">
                <Box render={<Field.Label />} flexDirection="column">
                    비밀번호 확인
                    <TextInput
                        type="password"
                        value={confirmPassword}
                        onValueChange={(value) => setConfirmPassword(value)}
                        placeholder="비밀번호를 다시 입력하세요"
                        pattern={password}
                    />
                </Box>

                <Field.Error match="patternMismatch">비밀번호가 일치하지 않습니다.</Field.Error>
            </Field.Root>
        </VStack>
    );
}
