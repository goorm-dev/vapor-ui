'use client';

import { Field, Radio, RadioGroup } from '@vapor-ui/core';

export default function FieldRadioGroup() {
    return (
        <Field.Root name="gender" className="v-space-y-3">
            <Field.Label>성별</Field.Label>
            <RadioGroup.Root className="v-space-y-2">
                <div className="v-flex v-items-center v-gap-2">
                    <Radio.Root value="male">
                        <Radio.Indicator />
                    </Radio.Root>
                    <Field.Label>남성</Field.Label>
                </div>
                <div className="v-flex v-items-center v-gap-2">
                    <Radio.Root value="female">
                        <Radio.Indicator />
                    </Radio.Root>
                    <Field.Label>여성</Field.Label>
                </div>
                <div className="v-flex v-items-center v-gap-2">
                    <Radio.Root value="other">
                        <Radio.Indicator />
                    </Radio.Root>
                    <Field.Label>기타</Field.Label>
                </div>
            </RadioGroup.Root>
            <Field.Description>개인정보 보호를 위해 선택사항입니다.</Field.Description>
        </Field.Root>
    );
}
