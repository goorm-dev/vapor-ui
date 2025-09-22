'use client';

import { useState } from 'react';

import { Field, TextInput } from '@vapor-ui/core';

export default function FieldValidation() {
    const [value, setValue] = useState('');
    const [showError, setShowError] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        if (e.target.value.length > 0) {
            setShowError(e.target.value.length < 3);
        } else {
            setShowError(false);
        }
    };

    return (
        <Field.Root name="password" className="v-space-y-2">
            <Field.Label>비밀번호</Field.Label>
            <TextInput
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={value}
                onChange={handleChange}
                className="v-w-full"
            />
            {showError && <Field.Error>비밀번호는 최소 3자 이상이어야 합니다.</Field.Error>}
            {value.length >= 3 && <Field.Success>✓ 사용 가능한 비밀번호입니다.</Field.Success>}
        </Field.Root>
    );
}
