'use client';

import { InputGroup, TextInput, VStack } from '@vapor-ui/core';

export default function DefaultInputGroup() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <InputGroup.Root>
                <TextInput placeholder="메시지를 입력하세요..." maxLength={100} />
                <InputGroup.Counter />
            </InputGroup.Root>
        </VStack>
    );
}
