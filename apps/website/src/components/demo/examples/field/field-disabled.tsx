'use client';

import { Field, Text, TextInput } from '@vapor-ui/core';

export default function FieldDisabled() {
    return (
        <Field.Root name="disabled" disabled>
            <Field.Label flexDirection="column">
                <Text typography="subtitle2" foreground="secondary-100">
                    비활성 필드
                </Text>
                <TextInput value="이 필드는 수정할 수 없습니다" />
            </Field.Label>

            <Field.Description>이 필드는 현재 비활성화되어 수정할 수 없습니다.</Field.Description>
        </Field.Root>
    );
}
