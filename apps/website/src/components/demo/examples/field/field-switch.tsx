'use client';

import { Box, Field, Switch } from '@vapor-ui/core';

export default function FieldSwitch() {
    return (
        <Field.Root name="notifications">
            <Box render={<Field.Label />} alignItems="center">
                <Switch.Root />
                알림 수신 동의
            </Box>
            <Field.Description>
                새로운 소식과 업데이트를 이메일로 받아보실 수 있습니다.
            </Field.Description>
        </Field.Root>
    );
}
