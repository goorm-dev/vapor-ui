'use client';

import { useState } from 'react';

import { Field, TextInput } from '@vapor-ui/core';

export default function FieldControlled() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const isEmailValid = email.includes('@') && email.includes('.');
    const showEmailError = email.length > 0 && !isEmailValid;

    return (
        <div className="v-space-y-6">
            <Field.Root name="firstName" className="v-space-y-2">
                <Field.Label>이름</Field.Label>
                <TextInput
                    placeholder="이름을 입력하세요"
                    className="v-w-full"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <Field.Description>현재 값: {firstName || '(비어있음)'}</Field.Description>
            </Field.Root>

            <Field.Root name="lastName" className="v-space-y-2">
                <Field.Label>성</Field.Label>
                <TextInput
                    placeholder="성을 입력하세요"
                    className="v-w-full"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <Field.Description>현재 값: {lastName || '(비어있음)'}</Field.Description>
            </Field.Root>

            <Field.Root name="email" className="v-space-y-2">
                <Field.Label>이메일</Field.Label>
                <TextInput
                    type="email"
                    placeholder="이메일을 입력하세요"
                    className="v-w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Field.Description>현재 값: {email || '(비어있음)'}</Field.Description>
                <Field.Error match={showEmailError}>올바른 이메일 형식이 아닙니다.</Field.Error>
                {isEmailValid && <Field.Success>유효한 이메일 형식입니다.</Field.Success>}
            </Field.Root>

            <div className="v-p-4 v-bg-gray-100 v-rounded-md">
                <h3 className="v-text-sm v-font-medium v-mb-2">현재 폼 상태</h3>
                <pre className="v-text-xs">
                    {JSON.stringify({ firstName, lastName, email }, null, 2)}
                </pre>
            </div>
        </div>
    );
}
