'use client';

import { useState } from 'react';

import { MultiSelect } from '@vapor-ui/core';

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
        <div className="space-y-4">
            <MultiSelect.Root
                placeholder="폰트 선택"
                value={value}
                onValueChange={handleValueChange}
                items={fonts}
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

            <p className="text-sm text-gray-600">
                선택된 값:{' '}
                <code className="bg-gray-100 px-1 rounded">
                    {value.length > 0 ? value.join(', ') : '없음'}
                </code>
            </p>

            <div className="flex gap-2">
                <button
                    onClick={() => setValue(['serif', 'mono'])}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Serif, Mono 선택
                </button>
                <button
                    onClick={() => setValue([])}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    모두 해제
                </button>
            </div>
        </div>
    );
}
