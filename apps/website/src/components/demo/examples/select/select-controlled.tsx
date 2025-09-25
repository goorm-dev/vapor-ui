'use client';

import { useState } from 'react';

import { Button, HStack, Select, Text } from '@vapor-ui/core';

export default function SelectControlled() {
    const [value, setValue] = useState<string>('');

    const handleValueChange = (newValue: unknown) => {
        setValue(newValue as string);
    };

    return (
        <div className="space-y-4">
            <Select.Root placeholder="폰트 선택" value={value} onValueChange={handleValueChange}>
                <Select.Trigger>
                    <Select.Value />
                    <Select.TriggerIcon />
                </Select.Trigger>

                <Select.Content>
                    <Select.Group>
                        <Select.GroupLabel>폰트</Select.GroupLabel>
                        <Select.Item value="sans">
                            Sans-serif
                            <Select.ItemIndicator />
                        </Select.Item>
                        <Select.Item value="serif">
                            Serif
                            <Select.ItemIndicator />
                        </Select.Item>
                        <Select.Item value="mono">
                            Monospace
                            <Select.ItemIndicator />
                        </Select.Item>
                        <Select.Item value="cursive">
                            Cursive
                            <Select.ItemIndicator />
                        </Select.Item>
                    </Select.Group>
                </Select.Content>
            </Select.Root>

            <Text typography="body2" foreground="secondary-darker">
                선택된 값: <code className="bg-gray-100 px-1 rounded">{value || '없음'}</code>
            </Text>

            <HStack gap="$100">
                <Button color="primary" onClick={() => setValue('serif')}>
                    Serif 선택
                </Button>
                <Button onClick={() => setValue('')} color="secondary">
                    선택 해제
                </Button>
            </HStack>
        </div>
    );
}
