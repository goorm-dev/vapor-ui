'use client';

import { Field, TextInput } from '@vapor-ui/core';

export default function FieldStates() {
    return (
        <div className="v-space-y-6">
            {/* Normal State */}
            <Field.Root name="normal" className="v-space-y-2">
                <Field.Label>일반 상태</Field.Label>
                <TextInput placeholder="일반 입력 필드" className="v-w-full" />
                <Field.Description>일반적인 필드 상태입니다.</Field.Description>
            </Field.Root>

            {/* Error State */}
            <Field.Root name="error" className="v-space-y-2">
                <Field.Label>오류 상태</Field.Label>
                <TextInput placeholder="오류가 있는 필드" className="v-w-full v-border-red-500" />
                <Field.Error match={true}>필수 입력 항목입니다. 값을 입력해주세요.</Field.Error>
            </Field.Root>

            {/* Success State */}
            <Field.Root name="success" className="v-space-y-2">
                <Field.Label>성공 상태</Field.Label>
                <TextInput
                    placeholder="유효한 필드"
                    className="v-w-full v-border-green-500"
                    defaultValue="valid@example.com"
                />
                <Field.Success>올바른 이메일 형식입니다.</Field.Success>
            </Field.Root>

            {/* Disabled State */}
            <Field.Root name="disabled" className="v-space-y-2">
                <Field.Label className="v-text-gray-400">비활성화 상태</Field.Label>
                <TextInput placeholder="비활성화된 필드" className="v-w-full" disabled />
                <Field.Description className="v-text-gray-400">
                    이 필드는 현재 비활성화되어 있습니다.
                </Field.Description>
            </Field.Root>
        </div>
    );
}
