import { MultiSelect } from '@vapor-ui/core';

const options = [
    { label: '옵션 1', value: 'option1' },
    { label: '옵션 2', value: 'option2' },
    { label: '옵션 3', value: 'option3' },
];

export default function MultiSelectStates() {
    return (
        <div className="flex flex-wrap gap-4">
            <MultiSelect.Root placeholder="기본 상태" items={options}>
                <MultiSelect.Trigger>
                    <MultiSelect.Value />
                    <MultiSelect.TriggerIcon />
                </MultiSelect.Trigger>
                <MultiSelect.Content>
                    {options.map((option) => (
                        <MultiSelect.Item key={option.value} value={option.value}>
                            {option.label}
                            <MultiSelect.ItemIndicator />
                        </MultiSelect.Item>
                    ))}
                </MultiSelect.Content>
            </MultiSelect.Root>

            <MultiSelect.Root placeholder="비활성화" disabled items={options}>
                <MultiSelect.Trigger>
                    <MultiSelect.Value />
                    <MultiSelect.TriggerIcon />
                </MultiSelect.Trigger>
                <MultiSelect.Content>
                    {options.map((option) => (
                        <MultiSelect.Item key={option.value} value={option.value}>
                            {option.label}
                            <MultiSelect.ItemIndicator />
                        </MultiSelect.Item>
                    ))}
                </MultiSelect.Content>
            </MultiSelect.Root>

            <MultiSelect.Root placeholder="읽기 전용" readOnly items={options}>
                <MultiSelect.Trigger>
                    <MultiSelect.Value />
                    <MultiSelect.TriggerIcon />
                </MultiSelect.Trigger>
                <MultiSelect.Content>
                    {options.map((option) => (
                        <MultiSelect.Item key={option.value} value={option.value}>
                            {option.label}
                            <MultiSelect.ItemIndicator />
                        </MultiSelect.Item>
                    ))}
                </MultiSelect.Content>
            </MultiSelect.Root>

            <MultiSelect.Root placeholder="오류 상태" invalid items={options}>
                <MultiSelect.Trigger>
                    <MultiSelect.Value />
                    <MultiSelect.TriggerIcon />
                </MultiSelect.Trigger>
                <MultiSelect.Content>
                    {options.map((option) => (
                        <MultiSelect.Item key={option.value} value={option.value}>
                            {option.label}
                            <MultiSelect.ItemIndicator />
                        </MultiSelect.Item>
                    ))}
                </MultiSelect.Content>
            </MultiSelect.Root>
        </div>
    );
}
