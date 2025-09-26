'use client';

import { useState } from 'react';

import { Field, TextInput } from '@vapor-ui/core';

export default function FieldRequired() {
    const [value, setValue] = useState('');
    const showError = value.length === 0;

    return (
        <div className="v-space-y-6">
            {/* Required Field */}
            <Field.Root name="required-field" className="v-space-y-2">
                <Field.Label>
                    필수 입력 필드 <span className="v-text-red-500">*</span>
                </Field.Label>
                <TextInput
                    placeholder="필수 입력 항목입니다"
                    className="v-w-full"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                />
                <Field.Description>
                    이 필드는 반드시 입력해야 하는 필수 항목입니다.
                </Field.Description>
                <Field.Error match={showError}>이 필드는 필수 입력 항목입니다.</Field.Error>
                {!showError && value.length > 0 && (
                    <Field.Success>입력이 완료되었습니다.</Field.Success>
                )}
            </Field.Root>

            {/* Optional Field */}
            <Field.Root name="optional-field" className="v-space-y-2">
                <Field.Label>
                    선택 입력 필드 <span className="v-text-gray-400">(선택사항)</span>
                </Field.Label>
                <TextInput placeholder="선택적으로 입력하세요" className="v-w-full" />
                <Field.Description>이 필드는 선택적으로 입력할 수 있습니다.</Field.Description>
            </Field.Root>
        </div>
    );
}
