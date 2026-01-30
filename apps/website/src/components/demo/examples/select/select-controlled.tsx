'use client';

import { useState } from 'react';

import { Button, HStack, Select, Text, VStack } from '@vapor-ui/core';

export default function SelectControlled() {
    const [value, setValue] = useState<string>('');

    const handleValueChange = (newValue: unknown) => {
        setValue(newValue as string);
    };

    return (
        <VStack gap="$200">
            <Select.Root placeholder="폰트 선택" value={value} onValueChange={handleValueChange}>
                <Select.Trigger />

                <Select.Popup>
                    <Select.Group>
                        <Select.GroupLabel>폰트</Select.GroupLabel>
                        <Select.Item value="sans">Sans-serif</Select.Item>
                        <Select.Item value="serif">Serif</Select.Item>
                        <Select.Item value="mono">Monospace</Select.Item>
                        <Select.Item value="cursive">Cursive</Select.Item>
                    </Select.Group>
                </Select.Popup>
            </Select.Root>

            <Text typography="body2" foreground="secondary-200">
                선택된 값: <code className="bg-gray-100 px-1 rounded">{value || '없음'}</code>
            </Text>

            <HStack gap="$100">
                <Button colorPalette="primary" onClick={() => setValue('serif')}>
                    Serif 선택
                </Button>
                <Button onClick={() => setValue('')} colorPalette="secondary">
                    선택 해제
                </Button>
            </HStack>
        </VStack>
    );
}
