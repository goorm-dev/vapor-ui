'use client';

import { InputGroup, Textarea } from '@vapor-ui/core';

export default function InputGroupTextarea() {
    return (
        <div className="space-y-4">
            <InputGroup.Root>
                <Textarea placeholder="긴 텍스트를 입력하세요..." maxLength={200} rows={4} />
                <InputGroup.Counter />
            </InputGroup.Root>
        </div>
    );
}
