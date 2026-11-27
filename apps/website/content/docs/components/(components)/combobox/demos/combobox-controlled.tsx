'use client';

import { useState } from 'react';

import { Button, Combobox, HStack, Text, VStack } from '@vapor-ui/core';

const fonts = ['Sans-serif', 'Serif', 'Monospace', 'Cursive'];

export default function ComboboxControlled() {
    const [value, setValue] = useState<string | null>(fonts[0]);

    return (
        <VStack $css={{ gap: '$200' }}>
            <Combobox.Root
                items={fonts}
                placeholder="폰트 선택"
                aria-label="폰트"
                value={value}
                onValueChange={setValue}
            >
                <Combobox.InputGroup />

                <Combobox.Popup>
                    <Combobox.Empty>검색 결과가 없습니다</Combobox.Empty>
                    {(font: string) => (
                        <Combobox.Item key={font} value={font}>
                            {font}
                        </Combobox.Item>
                    )}
                </Combobox.Popup>
            </Combobox.Root>

            <Text typography="body2" foreground="secondary-200">
                선택된 값: <code className="bg-gray-100 px-1 rounded">{value ?? '없음'}</code>
            </Text>

            <HStack $css={{ gap: '$100' }}>
                <Button colorPalette="primary" onClick={() => setValue('Serif')}>
                    Serif 선택
                </Button>
                <Button colorPalette="secondary" onClick={() => setValue(null)}>
                    선택 해제
                </Button>
            </HStack>
        </VStack>
    );
}
