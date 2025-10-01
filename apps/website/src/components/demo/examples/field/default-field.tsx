'use client';

import { Field, TextInput } from '@vapor-ui/core';

export default function DefaultField() {
    return (
        <Field.Root name="username" className="v-space-y-2">
            <Field.Label>Field.Label</Field.Label>
            <TextInput placeholder="사용자명을 입력하세요" className="v-w-full" />
            <Field.Description>Field.Description</Field.Description>
            <Field.Error match={true}>Field.Error</Field.Error>
            <Field.Success>Field.Success</Field.Success>
        </Field.Root>
    );
}
