'use client';

import { Box, Field, Radio, RadioGroup } from '@vapor-ui/core';

export default function FieldRadioGroup() {
    return (
        <Field.Root name="gender">
            <RadioGroup.Root>
                <RadioGroup.Label>성별</RadioGroup.Label>

                <Box render={<Field.Label />} alignItems="center">
                    <Radio.Root value="male" />
                    남성
                </Box>

                <Box render={<Field.Label />} alignItems="center">
                    <Radio.Root value="female" />
                    여성
                </Box>

                <Box render={<Field.Label />} alignItems="center">
                    <Radio.Root value="other" />
                    기타
                </Box>
            </RadioGroup.Root>

            <Field.Description>개인정보 보호를 위해 선택사항입니다.</Field.Description>
        </Field.Root>
    );
}
