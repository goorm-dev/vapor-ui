'use client';

import { Checkbox, Field, HStack } from '@vapor-ui/core';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';

export default function FieldCheckbox() {
    return (
        <Field.Root name="agreement" className="v-space-y-2">
            <HStack gap="$100" alignItems="center">
                <Checkbox.Root>
                    <Checkbox.Indicator>
                        <ConfirmOutlineIcon />
                    </Checkbox.Indicator>
                </Checkbox.Root>
                <Field.Label>이용약관에 동의합니다</Field.Label>
            </HStack>
            <Field.Description>서비스 이용을 위해 이용약관에 동의해주세요.</Field.Description>
        </Field.Root>
    );
}
