'use client';

import { Field, Radio, RadioGroup } from '@vapor-ui/core';

export default function FieldRadioGroup() {
    return (
        <Field.Root name="gender">
            <RadioGroup.Root>
                <RadioGroup.Label>성별</RadioGroup.Label>

                <Field.HLabel>
                    <Radio.Root value="male" />
                    남성
                </Field.HLabel>

                <Field.HLabel>
                    <Radio.Root value="female" />
                    여성
                </Field.HLabel>

                <Field.HLabel>
                    <Radio.Root value="other" />
                    기타
                </Field.HLabel>
            </RadioGroup.Root>

            <Field.Description>개인정보 보호를 위해 선택사항입니다.</Field.Description>
        </Field.Root>
    );
}
