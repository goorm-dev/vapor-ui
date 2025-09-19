import React from 'react';

import { InputGroup, TextInput } from '@vapor-ui/core';

export default function DefaultInputGroup() {
    const [value, setValue] = React.useState('');
    return (
        <div className="space-y-4">
            <InputGroup.Root>
                <TextInput
                    onValueChange={(value) => {
                        setValue(value);
                    }}
                    value={value}
                    placeholder="메시지를 입력하세요..."
                    maxLength={100}
                />
                <InputGroup.Counter />
            </InputGroup.Root>
        </div>
    );
}
