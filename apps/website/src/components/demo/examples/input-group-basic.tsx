'use client';

import { InputGroup, TextInput } from '@vapor-ui/core';

export default function InputGroupBasic() {
    return (
        <div className="space-y-4">
            <InputGroup.Root>
                <TextInput placeholder="최대 길이 제한 있음" maxLength={50} />
                <InputGroup.Counter />
            </InputGroup.Root>
            <InputGroup.Root>
                <TextInput placeholder="최대 길이 제한 없음" />
                <InputGroup.Counter />
            </InputGroup.Root>
        </div>
    );
}
