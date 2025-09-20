'use client';

import { InputGroup, TextInput } from '@vapor-ui/core';

export default function DefaultInputGroup() {
    return (
        <div className="space-y-4">
            <InputGroup.Root>
                <TextInput placeholder="메시지를 입력하세요..." maxLength={100} />
                <InputGroup.Counter />
            </InputGroup.Root>
        </div>
    );
}
