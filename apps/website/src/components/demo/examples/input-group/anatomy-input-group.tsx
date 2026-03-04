'use client';

import { InputGroup, TextInput } from '@vapor-ui/core';

export default function AnatomyInputGroup() {
    return (
        <InputGroup.Root data-part="Root">
            <TextInput placeholder="메시지를 입력하세요..." maxLength={100} width="100%" />
            <InputGroup.Counter data-part="Counter" />
        </InputGroup.Root>
    );
}
