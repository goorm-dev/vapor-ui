'use client';

import { Field, InputGroup, TextInput, VStack } from '@vapor-ui/core';

export default function InputGroupField() {
    return (
        <VStack className="w-80" $css={{ gap: '$300' }}>
            <Field.Root name="email" validationMode="onChange">
                <VStack render={<Field.Label />} $css={{ gap: '$050' }}>
                    Email
                    <InputGroup.Root>
                        <InputGroup.LeadingAddon>✉</InputGroup.LeadingAddon>
                        <TextInput type="email" placeholder="you@example.com" required />
                    </InputGroup.Root>
                </VStack>
                <Field.Error match="typeMismatch">유효한 이메일을 입력하세요</Field.Error>
                <Field.Error match="valueMissing">이메일은 필수입니다</Field.Error>
            </Field.Root>
        </VStack>
    );
}
