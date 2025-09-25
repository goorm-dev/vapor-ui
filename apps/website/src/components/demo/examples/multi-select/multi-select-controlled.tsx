'use client';

import { useState } from 'react';

import { Button, HStack, MultiSelect, Text, VStack } from '@vapor-ui/core';

const fonts = [
    { label: 'Sans-serif', value: 'sans' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'mono' },
    { label: 'Cursive', value: 'cursive' },
];

export default function MultiSelectControlled() {
    const [value, setValue] = useState<string[]>([]);

    const handleValueChange = (newValue: unknown) => {
        setValue(newValue as string[]);
    };

    return (
        <VStack gap="$200" width="400px">
            <MultiSelect.Root
                items={fonts}
                value={value}
                onValueChange={handleValueChange}
                placeholder="폰트 선택"
            >
                <MultiSelect.Trigger>
                    <MultiSelect.Value />
                    <MultiSelect.TriggerIcon />
                </MultiSelect.Trigger>

                <MultiSelect.Content>
                    {fonts.map((font) => (
                        <MultiSelect.Item key={font.value} value={font.value}>
                            {font.label}
                            <MultiSelect.ItemIndicator />
                        </MultiSelect.Item>
                    ))}
                </MultiSelect.Content>
            </MultiSelect.Root>

            <Text typography="body2" foreground="secondary-darker">
                선택된 값:{' '}
                <code className="bg-gray-100 px-1 rounded">
                    {value.length > 0 ? value.join(', ') : '없음'}
                </code>
            </Text>

            <HStack gap="$100">
                <Button color="primary" onClick={() => setValue(['serif', 'mono'])}>
                    Serif, Mono 선택
                </Button>
                <Button color="secondary" onClick={() => setValue([])}>
                    모두 해제
                </Button>
            </HStack>
        </VStack>
    );
}
