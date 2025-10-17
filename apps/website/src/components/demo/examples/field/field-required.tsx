'use client';

import { Field, Text, TextInput, VStack } from '@vapor-ui/core';

export default function FieldRequired() {
    return (
        <VStack gap="$200" width="300px">
            <Field.Root name="required-field">
                <Field.VLabel>
                    <span>
                        필수 입력 필드 <Text foreground="danger-100">*</Text>
                    </span>
                    <TextInput required placeholder="필수 입력 항목입니다" />
                </Field.VLabel>
                <Field.Description>
                    이 필드는 반드시 입력해야 하는 필수 항목입니다.
                </Field.Description>
                <Field.Error match="valueMissing">이 필드는 필수 입력 항목입니다.</Field.Error>
                <Field.Success>입력이 완료되었습니다.</Field.Success>
            </Field.Root>

            {/* Optional Field */}
            <Field.Root name="optional-field">
                <Field.VLabel>
                    <span>
                        선택 입력 필드{' '}
                        <Text foreground="hint-100" typography="subtitle2">
                            (선택사항)
                        </Text>
                    </span>
                    <TextInput placeholder="선택적으로 입력하세요" />
                </Field.VLabel>
                <Field.Description>이 필드는 선택적으로 입력할 수 있습니다.</Field.Description>
            </Field.Root>
        </VStack>
    );
}
