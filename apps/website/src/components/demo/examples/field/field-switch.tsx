'use client';

import { Field, HStack, Switch } from '@vapor-ui/core';

export default function FieldSwitch() {
    return (
        <Field.Root name="notifications" className="v-space-y-2">
            <HStack alignItems="center" justifyContent="space-between" className="v-w-full">
                <Field.Label>알림 수신 동의</Field.Label>
                <Switch.Root />
            </HStack>
            <Field.Description>
                새로운 소식과 업데이트를 이메일로 받아보실 수 있습니다.
            </Field.Description>
        </Field.Root>
    );
}
