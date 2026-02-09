'use client';

import { Field, Radio, RadioGroup, VStack } from '@vapor-ui/core';

export default function FieldRadioGroup() {
    return (
        <Field.Root name="gender">
            <VStack $styles={{ gap: '$300' }}>
                <RadioGroup.Root>
                    <VStack $styles={{ gap: '$100' }}>
                        <RadioGroup.Label>성별</RadioGroup.Label>
                        <VStack $styles={{ gap: '$050' }}>
                            <Field.Item $styles={{ alignItems: 'center' }}>
                                <Radio.Root value="male" />
                                <Field.Label>남성</Field.Label>
                            </Field.Item>

                            <Field.Item $styles={{ alignItems: 'center' }}>
                                <Radio.Root value="female" />
                                <Field.Label>여성</Field.Label>
                            </Field.Item>

                            <Field.Item $styles={{ alignItems: 'center' }}>
                                <Radio.Root value="other" />
                                <Field.Label>기타</Field.Label>
                            </Field.Item>
                        </VStack>
                    </VStack>
                </RadioGroup.Root>

                <Field.Description>개인정보 보호를 위해 선택사항입니다.</Field.Description>
            </VStack>
        </Field.Root>
    );
}
