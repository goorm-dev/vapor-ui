'use client';

import { useState } from 'react';

import { Field, Text, TextInput, VStack } from '@vapor-ui/core';

export default function FieldValidation() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <VStack gap="$200" width="300px">
            <Field.Root name="email" validationMode="onBlur">
                <Field.Label flexDirection="column">
                    <Text typography="subtitle2">이메일</Text>
                    <TextInput type="email" required placeholder="이메일을 입력하세요" />
                </Field.Label>

                <Field.Description>최소 8자 이상 입력해주세요.</Field.Description>
                <Field.Error match="valueMissing">이메일을 입력해주세요.</Field.Error>
                <Field.Error match="typeMismatch">유효한 이메일 주소를 입력해주세요.</Field.Error>
                <Field.Success match="valid">올바른 이메일 형식입니다.</Field.Success>
            </Field.Root>

            <Field.Root name="password" validationMode="onBlur">
                <Field.Label flexDirection="column">
                    <Text typography="subtitle2">비밀번호</Text>
                    <TextInput
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onValueChange={(value) => setPassword(value)}
                        placeholder="비밀번호를 입력하세요"
                    />
                </Field.Label>

                <Field.Description>최소 8자 이상 입력해주세요.</Field.Description>
                <Field.Error match="valueMissing">비밀번호를 입력해주세요.</Field.Error>
                <Field.Error match="tooShort">비밀번호는 최소 8자 이상이어야 합니다.</Field.Error>
                <Field.Success match="valid">유효한 비밀번호입니다.</Field.Success>
            </Field.Root>

            <Field.Root name="confirmPassword">
                <Field.Label flexDirection="column">
                    <Text typography="subtitle2">비밀번호 확인</Text>
                    <TextInput
                        type="password"
                        value={confirmPassword}
                        onValueChange={(value) => setConfirmPassword(value)}
                        placeholder="비밀번호를 다시 입력하세요"
                        pattern={password}
                    />
                </Field.Label>

                <Field.Error match="patternMismatch">비밀번호가 일치하지 않습니다.</Field.Error>
                <Field.Success match="valid">비밀번호가 일치합니다.</Field.Success>
            </Field.Root>
        </VStack>
    );
}
