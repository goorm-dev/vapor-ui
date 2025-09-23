'use client';

import { useState } from 'react';

import { Select } from '@vapor-ui/core';

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

            <p className="text-sm text-gray-600">
                선택된 값: <code className="bg-gray-100 px-1 rounded">{value || '없음'}</code>
            </p>

            <div className="flex gap-2">
                <button
                    onClick={() => setValue('serif')}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Serif 선택
                </button>
                <button
                    onClick={() => setValue('')}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    선택 해제
                </button>
            </div>
        </div>
    );
}
