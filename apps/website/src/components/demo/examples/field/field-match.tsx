'use client';

import { useState } from 'react';

import { Field, TextInput } from '@vapor-ui/core';

export default function FieldMatch() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const isPasswordWeak = password.length > 0 && password.length < 8;
    const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

    return (
        <div className="v-space-y-4">
            <Field.Root name="password" className="v-space-y-2">
                <Field.Label>비밀번호</Field.Label>
                <TextInput
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(event) => {
                        const { value } = event.currentTarget;
                        setPassword(String(value));
                    }}
                    className="v-w-full"
                />
                <Field.Description>최소 8자 이상 입력해주세요.</Field.Description>
                {/* match={true}로 에러를 강제 표시 */}
                <Field.Error match={isPasswordWeak}>
                    비밀번호는 최소 8자 이상이어야 합니다.
                </Field.Error>
            </Field.Root>

            <Field.Root name="confirmPassword" className="v-space-y-2">
                <Field.Label>비밀번호 확인</Field.Label>
                <TextInput
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(event) => {
                        const { value } = event.currentTarget;
                        setConfirmPassword(String(value));
                    }}
                    className="v-w-full"
                />
                {/* 조건부로 에러 표시 */}
                <Field.Error match={isPasswordMismatch}>비밀번호가 일치하지 않습니다.</Field.Error>
            </Field.Root>
        </div>
    );
}
